"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SelectAdmin as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/admin_select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, HelpCircle, Link2Off, CheckCircle2 } from "lucide-react";
import { FileDropzone } from "@/components/molecules/FileDropzone";
import { RepoSettings } from "@/types/versionControlTypes";
import { Badge } from "@/components/ui/badge";

interface RepositorySettingsFormProps {
  onCheckAccess: (payload: RepoSettings) => Promise<void>;
  onSave: (payload: RepoSettings) => Promise<void>;
  onUnlink?: () => Promise<void>;
  isChecking: boolean;
  isSaving: boolean;
  isConfigured?: boolean;
  isDeleting?: boolean;
  initialValues?: RepoSettings | null;
}

export function RepositorySettingsForm({
  onCheckAccess,
  onSave,
  onUnlink,
  isChecking,
  isSaving,
  isConfigured,
  isDeleting,
  initialValues,
}: RepositorySettingsFormProps) {
  const [repositoryUri, setRepositoryUri] = useState(
    initialValues?.repositoryUri || "",
  );
  const [defaultBranch, setDefaultBranch] = useState(
    initialValues?.defaultBranch || "main",
  );
  const [readOnly, setReadOnly] = useState(initialValues?.readOnly || false);
  const [showMergeCommits, setShowMergeCommits] = useState(
    initialValues?.showMergeCommits || false,
  );
  const [authMethod, setAuthMethod] = useState<
    "USERNAME_PASSWORD" | "PRIVATE_KEY"
  >(initialValues?.authMethod || "USERNAME_PASSWORD");
  const [username, setUsername] = useState(initialValues?.username || "");
  const [password, setPassword] = useState(initialValues?.password || "");
  const [privateKey, setPrivateKey] = useState(initialValues?.privateKey || "");
  const [privateKeyPassword, setPrivateKeyPassword] = useState(
    initialValues?.privateKeyPassword || "",
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const buildPayload = (): RepoSettings => {
    const payload: RepoSettings = {
      repositoryUri,
      defaultBranch,
      readOnly,
      showMergeCommits,
      authMethod,
      username: authMethod === "USERNAME_PASSWORD" ? username || null : null,
      password: authMethod === "USERNAME_PASSWORD" ? password || null : null,
    };
    if (authMethod === "PRIVATE_KEY") {
      payload.privateKey = privateKey || null;
      payload.privateKeyPassword = privateKeyPassword || null;
    }
    return payload;
  };

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setPrivateKey(content);
      };
      reader.readAsText(file);
    } else {
      setPrivateKey("");
    }
  };

  const handleCheckAccess = async () => {
    await onCheckAccess(buildPayload());
  };

  const handleSave = async () => {
    await onSave(buildPayload());
  };

  return (
    <Card
      className={`w-full max-w-3xl mx-auto transition-all duration-300 ${isConfigured ? "border-green-500/30 shadow-md shadow-green-500/5 dark:border-green-400/20" : ""}`}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <CardTitle className="text-xl font-bold dark:text-white">
            Repository settings
          </CardTitle>
          {isConfigured && (
            <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/20 flex items-center gap-1 px-2 py-1">
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isConfigured && onUnlink && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onUnlink}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-8"
            >
              <Link2Off className="h-4 w-4 mr-2" />
              {isDeleting ? "Unlinking..." : "Unlink"}
            </Button>
          )}
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Repository URL */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground dark:text-slate-400">
            Repository URL*
          </Label>
          <Input
            value={repositoryUri}
            onChange={(e) => setRepositoryUri(e.target.value)}
            placeholder="Repository URL*"
            className="dark:text-white border-0 border-b rounded-none bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-0 focus-visible:border-primary"
          />
        </div>

        {/* Default branch */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground dark:text-slate-400">
            Default branch name
          </Label>
          <Input
            value={defaultBranch}
            onChange={(e) => setDefaultBranch(e.target.value)}
            placeholder="Default branch name"
            className="dark:text-white border-0 border-b rounded-none bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-0 focus-visible:border-primary"
          />
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="read-only"
              checked={readOnly}
              onCheckedChange={(checked) => setReadOnly(checked as boolean)}
            />
            <Label
              htmlFor="read-only"
              className="cursor-pointer dark:text-white"
            >
              Read-only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-merge-commits"
              checked={showMergeCommits}
              onCheckedChange={(checked) =>
                setShowMergeCommits(checked as boolean)
              }
            />
            <Label
              htmlFor="show-merge-commits"
              className="cursor-pointer dark:text-white"
            >
              Show merge commits
            </Label>
          </div>
        </div>

        {/* Authentication settings fieldset */}
        <fieldset className="border border-slate-200 dark:border-slate-700 rounded-md p-4 space-y-4">
          <legend className="text-sm text-muted-foreground dark:text-slate-400 px-2">
            Authentication settings
          </legend>

          {/* Auth method dropdown */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground dark:text-slate-400">
              Authentication method*
            </Label>
            <Select
              value={authMethod}
              onValueChange={(val: string) =>
                setAuthMethod(val as "USERNAME_PASSWORD" | "PRIVATE_KEY")
              }
            >
              <SelectTrigger className="w-full dark:text-white border-0 border-b rounded-none bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USERNAME_PASSWORD">
                  Password / access token
                </SelectItem>
                <SelectItem value="PRIVATE_KEY">Private key</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {authMethod === "USERNAME_PASSWORD" ? (
            <>
              {/* Username */}
              <div className="space-y-1">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="dark:text-white border-0 border-b rounded-none bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-0 focus-visible:border-primary"
                />
              </div>

              {/* Password / access token */}
              <div className="space-y-1 relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password / access token"
                  className="dark:text-white border-0 border-b rounded-none bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-0 focus-visible:border-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <p className="text-xs text-muted-foreground dark:text-slate-400">
                GitHub users <strong>must</strong> use access{" "}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary/80 dark:text-blue-400"
                >
                  tokens
                </a>{" "}
                with write permissions to the repository.
              </p>
            </>
          ) : (
            <>
              {/* Private key file dropzone */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground dark:text-slate-400">
                  Private key*
                </Label>
                <FileDropzone
                  onFilesSelected={handleFilesSelected}
                  selectedFiles={selectedFiles}
                  onRemoveFile={() => handleFilesSelected([])}
                />
              </div>

              {/* Passphrase */}
              <div className="space-y-1 relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={privateKeyPassword}
                  onChange={(e) => setPrivateKeyPassword(e.target.value)}
                  placeholder="Passphrase"
                  className="dark:text-white border-0 border-b rounded-none bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-0 focus-visible:border-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </>
          )}
        </fieldset>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleCheckAccess}
            disabled={isChecking || !repositoryUri}
          >
            {isChecking ? "Checking..." : "Check access"}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !repositoryUri}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
