import { useState, useEffect } from "react";
import { Download, Wifi, Settings, CheckCircle, AlertCircle, Info, Github, Sun, Moon, Monitor } from "lucide-react";
import { open } from "@tauri-apps/plugin-shell";
import { DownloaderPage } from "@/components/pages/DownloaderPage";
import { NetworkPage } from "@/components/pages/NetworkPage";
import { SettingsPage } from "@/components/pages/SettingsPage";
import { AboutPage } from "@/components/pages/AboutPage";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { TitleBar } from "@/components/ui/TitleBar";
import { APP_VERSION, GITHUB_PROFILE, CREATOR_NAME } from "@/lib/constants";
import { useTheme } from "@/lib/theme";
import * as tauri from "@/lib/tauri";

type Tab = "downloader" | "network" | "settings" | "about";

interface Account {
  id: string;
  username: string;
  password: string;
}

const ACCOUNTS_KEY = "workshop-downloader-accounts";

function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as Account[]) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const { mode, setMode } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("downloader");

  // Accounts are stored locally on this PC (browser storage inside the app)
  const [accounts, setAccounts] = useState<Account[]>(loadAccounts);
  const [selectedAccount, setSelectedAccount] = useState(
    () => loadAccounts()[0]?.id ?? ""
  );
  const [downloadPath, setDownloadPath] = useState("Not set");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [dotnetInstalled, setDotnetInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const installed = await tauri.checkDotnetRuntime();
        setDotnetInstalled(installed);
        const settings = await tauri.loadSettings();
        if (settings.download_path) setDownloadPath(settings.download_path);

        // Listen for download logs
        await tauri.listenDownloadLog((log) => {
          addLog(log.line);
        });
      } catch {
        setDotnetInstalled(null);
      }
    };
    init();
  }, []);

  const saveAccounts = (list: Account[]) => {
    setAccounts(list);
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
    } catch {
      /* ignore storage errors */
    }
  };

  const addAccount = (username: string, password: string) => {
    const acc: Account = { id: Date.now().toString(), username, password };
    saveAccounts([...accounts, acc]);
    setSelectedAccount(acc.id);
  };

  const removeAccount = (id: string) => {
    const list = accounts.filter((a) => a.id !== id);
    saveAccounts(list);
    if (selectedAccount === id) setSelectedAccount(list[0]?.id ?? "");
  };

  const addLog = (msg: string) => {
    setConsoleOutput((prev) => [...prev.slice(-100), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const clearConsole = () => {
    setConsoleOutput([]);
  };

  const recheckDotnet = async () => {
    try {
      const installed = await tauri.checkDotnetRuntime();
      setDotnetInstalled(installed);
    } catch {
      setDotnetInstalled(false);
    }
  };

  const selectDirectory = async (appId?: string) => {
    try {
      const folder = await tauri.selectFolder(appId);
      if (!folder) return;

      setDownloadPath(folder);
      addLog(`Path set to ${folder}`);
      const current = await tauri.loadSettings();
      await tauri.saveSettings({ ...current, download_path: folder });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      addLog(`Error selecting folder: ${message}`);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Custom Title Bar */}
      <TitleBar />

      {/* Header with Navigation */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface">
        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("downloader")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTab === "downloader"
              ? "bg-foreground text-surface"
              : "text-foreground-muted hover:bg-surface-hover"
              }`}
          >
            <Download className="w-3.5 h-3.5 inline mr-1.5" />
            Downloader
          </button>
          <button
            onClick={() => setActiveTab("network")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTab === "network"
              ? "bg-foreground text-surface"
              : "text-foreground-muted hover:bg-surface-hover"
              }`}
          >
            <Wifi className="w-3.5 h-3.5 inline mr-1.5" />
            Network
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTab === "settings"
              ? "bg-foreground text-surface"
              : "text-foreground-muted hover:bg-surface-hover"
              }`}
          >
            <Settings className="w-3.5 h-3.5 inline mr-1.5" />
            Settings
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTab === "about"
              ? "bg-foreground text-surface"
              : "text-foreground-muted hover:bg-surface-hover"
              }`}
          >
            <Info className="w-3.5 h-3.5 inline mr-1.5" />
            About
          </button>
        </nav>

        {/* Right Section: Social Links + Version + .NET Status */}
        <div className="flex items-center gap-2">
          {/* Creator + Theme */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => open(GITHUB_PROFILE)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-surface-hover transition-colors group"
              title="GitHub"
            >
              <Github className="w-3.5 h-3.5 text-foreground-muted group-hover:text-foreground transition-colors" />
              <span className="text-xs font-medium text-primary">{CREATOR_NAME}</span>
            </button>
            <button
              onClick={() => setMode(mode === "system" ? "light" : mode === "light" ? "dark" : "system")}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-surface-hover transition-colors text-foreground-muted hover:text-foreground"
              title={`Theme: ${mode === "system" ? "System" : mode === "light" ? "Light" : "Dark"} (click to change)`}
            >
              {mode === "system" ? <Monitor className="w-3.5 h-3.5" /> : mode === "light" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Version Badge */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/30">
            v{APP_VERSION}
          </div>

          {/* .NET Status */}
          <button
            onClick={recheckDotnet}
            title="Click to re-check .NET status"
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-opacity hover:opacity-70"
            style={{
              backgroundColor: dotnetInstalled === true ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              color: dotnetInstalled === true ? "#22c55e" : "#ef4444",
            }}
          >
            {dotnetInstalled === true ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            {dotnetInstalled === true ? ".NET 9.0" : "No .NET"}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "downloader" && (
          <DownloaderPage
            accounts={accounts}
            selectedAccountId={selectedAccount}
            onAccountChange={setSelectedAccount}
            onAddAccount={addAccount}
            onRemoveAccount={removeAccount}
            downloadPath={downloadPath}
            onSelectPath={selectDirectory}
            consoleOutput={consoleOutput}
            onClearConsole={clearConsole}
            addLog={addLog}
            dotnetInstalled={dotnetInstalled}
            onRecheckDotnet={recheckDotnet}
          />
        )}

        {activeTab === "network" && <NetworkPage />}

        {activeTab === "settings" && <SettingsPage dotnetInstalled={dotnetInstalled} onRecheckDotnet={recheckDotnet} />}

        {activeTab === "about" && <AboutPage />}
      </div>

      {/* Toast Container for notifications */}
      <ToastContainer />
    </div>
  );
}
