import { Info, Github, ExternalLink, Sparkles } from "lucide-react";
import { open } from "@tauri-apps/plugin-shell";
import { useState, useEffect } from "react";
import { APP_VERSION, GITHUB_REPO, GITHUB_PROFILE, CREATOR_NAME, ORIGINAL_AUTHOR, ORIGINAL_REPO } from "@/lib/constants";

interface Release {
    version: string;
    date: string;
    changes: string[];
}

interface GitHubRelease {
    tag_name: string;
    published_at: string;
    body: string;
}

// Fallback changelog data if GitHub API fails
const FALLBACK_RELEASES: Release[] = [
    {
        version: "1.0.0",
        date: "2026-01-21",
        changes: [
            "Initial release",
        ],
    },
];

const CURRENT_VERSION = APP_VERSION;

export function AboutPage() {
    const [releases, setReleases] = useState<Release[]>(FALLBACK_RELEASES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReleases();
    }, []);

    const fetchReleases = async () => {
        try {
            const response = await fetch("https://api.github.com/repos/PRO-MAXx/wallpapershop-downloader/releases");
            if (!response.ok) throw new Error("Failed to fetch releases");

            const data: GitHubRelease[] = await response.json();

            const parsedReleases: Release[] = data.map((release) => {
                // Parse version from tag (remove 'v' prefix if exists)
                const version = release.tag_name.replace(/^v/, "");

                // Format date
                const date = new Date(release.published_at).toISOString().split("T")[0];

                // Parse changelog from body (split by lines starting with - or *)
                const changes = release.body
                    .split("\n")
                    .filter(line => line.trim().match(/^[-*]\s+/))
                    .map(line => line.trim().replace(/^[-*]\s+/, ""));

                return { version, date, changes };
            });

            if (parsedReleases.length > 0) {
                setReleases(parsedReleases);
            }
        } catch (error) {
            console.error("Failed to fetch releases from GitHub:", error);
            // Keep fallback data
        } finally {
            setLoading(false);
        }
    };

    const openLink = async (url: string) => {
        try {
            await open(url);
        } catch (error) {
            console.error("Failed to open link:", error);
        }
    };

    return (
        <div className="h-full p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg">
                        <img src="/icon.png" alt="App Icon" className="w-16 h-16 rounded-2xl" />
                    </div>
                    <h2 className="text-xl font-semibold mb-1">Wallpapershop Downloader</h2>
                    <p className="text-foreground-muted text-sm mb-3 flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        Version {CURRENT_VERSION}
                    </p>
                    <p className="text-xs text-muted mb-2">
                        Download Steam Workshop items without owning the game
                    </p>

                    {/* Quick Links in Header */}
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={() => openLink(GITHUB_REPO)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-surface-hover border border-border rounded-full text-xs transition-colors"
                        >
                            <Github className="w-3.5 h-3.5" />
                            GitHub
                        </button>
                        <button
                            onClick={() => openLink(`${GITHUB_REPO}/releases`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-surface-hover border border-border rounded-full text-xs transition-colors"
                        >
                            <Info className="w-3.5 h-3.5" />
                            Changelog
                        </button>
                    </div>
                </div>

                {/* Links */}
                <div className="bg-surface rounded-lg border border-border p-4">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-primary" />
                        Links
                    </h3>

                    <div className="space-y-2">
                        <button
                            onClick={() => openLink(GITHUB_REPO)}
                            className="w-full flex items-center justify-between p-3 bg-background hover:bg-surface-hover rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Github className="w-5 h-5" />
                                <div className="text-left">
                                    <p className="text-sm font-medium">GitHub Repository</p>
                                    <p className="text-xs text-foreground-muted">View source code & report issues</p>
                                </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted" />
                        </button>

                        <button
                            onClick={() => openLink(`${GITHUB_REPO}/releases`)}
                            className="w-full flex items-center justify-between p-3 bg-background hover:bg-surface-hover rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <div className="text-left">
                                    <p className="text-sm font-medium">Releases</p>
                                    <p className="text-xs text-foreground-muted">Download latest version</p>
                                </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted" />
                        </button>
                    </div>
                </div>

                {/* Changelog */}
                <div className="bg-surface rounded-lg border border-border p-4">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" />
                        Changelog
                        {loading && <span className="text-xs text-muted">(Loading...)</span>}
                    </h3>

                    <div className="space-y-4">
                        {releases.map((release) => (
                            <div key={release.version} className="border-l-2 border-primary pl-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-semibold">v{release.version}</span>
                                    <span className="text-xs text-muted bg-background px-2 py-0.5 rounded">
                                        {release.date}
                                    </span>
                                    {release.version === CURRENT_VERSION && (
                                        <span className="text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded">
                                            Current
                                        </span>
                                    )}
                                </div>
                                <ul className="space-y-1">
                                    {release.changes.length > 0 ? (
                                        release.changes.map((change, idx) => (
                                            <li key={idx} className="text-xs text-foreground-muted flex items-start gap-2">
                                                <span className="text-primary mt-0.5">•</span>
                                                {change}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-xs text-foreground-muted">No changelog available</li>
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Credits */}
                <div className="text-center text-xs text-muted py-4">
                    <p>Customized by <button onClick={() => openLink(GITHUB_PROFILE)} className="text-primary hover:underline">{CREATOR_NAME}</button></p>
                    <p className="mt-1">Based on the original Steam Workshop Downloader by <button onClick={() => openLink(ORIGINAL_REPO)} className="text-primary hover:underline">{ORIGINAL_AUTHOR}</button></p>
                    <p className="mt-1">Powered by Tauri + React. Uses DepotDownloaderMod (GPL-2.0)</p>
                </div>
            </div>
        </div>
    );
}