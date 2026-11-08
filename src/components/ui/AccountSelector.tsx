import { useState } from "react";
import { User, ChevronDown, Plus, Trash2 } from "lucide-react";

export interface Account {
    id: string;
    username: string;
    password: string;
}

interface AccountSelectorProps {
    accounts: Account[];
    selectedAccountId: string;
    onAccountChange: (accountId: string) => void;
    onAddAccount: (username: string, password: string) => void;
    onRemoveAccount: (accountId: string) => void;
}

export function AccountSelector({
    accounts,
    selectedAccountId,
    onAccountChange,
    onAddAccount,
    onRemoveAccount,
}: AccountSelectorProps) {
    const [showForm, setShowForm] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSave = () => {
        const u = username.trim();
        if (!u || !password) return;
        onAddAccount(u, password);
        setUsername("");
        setPassword("");
        setShowForm(false);
    };

    return (
        <div className="bg-surface rounded-lg p-3 border border-border">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium">Steam Account</span>
                </div>
                <div className="flex items-center gap-2">
                    {accounts.length > 0 && selectedAccountId && (
                        <button
                            type="button"
                            onClick={() => onRemoveAccount(selectedAccountId)}
                            title="Remove selected account"
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowForm((v) => !v)}
                        className="flex items-center gap-1 text-xs text-primary hover:opacity-70"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                    </button>
                </div>
            </div>

            {accounts.length > 0 ? (
                <div className="relative">
                    <select
                        value={selectedAccountId}
                        onChange={(e) => onAccountChange(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm appearance-none cursor-pointer"
                    >
                        {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                                {acc.username}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                </div>
            ) : (
                <p className="text-xs text-foreground-muted">
                    No accounts yet. Click "Add" to save one.
                </p>
            )}

            {showForm && (
                <div className="mt-3 space-y-2">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Steam username"
                        autoComplete="off"
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                        placeholder="Password"
                        autoComplete="off"
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                    />
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!username.trim() || !password}
                        className="w-full px-3 py-2 rounded-md text-sm font-medium bg-foreground text-surface disabled:opacity-40"
                    >
                        Save account
                    </button>
                </div>
            )}
        </div>
    );
}
