import { spawn } from "node:child_process";

export function runProcess(command: string, args: string[], timeoutMs = 120_000): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });
    const timer = setTimeout(() => { child.kill(); reject(new Error(`${command} timed out`)); }, timeoutMs);
    child.once("error", (error) => { clearTimeout(timer); reject(error); });
    child.once("exit", (code) => { clearTimeout(timer); code === 0 ? resolve() : reject(new Error(`${command} failed (${code}): ${stderr.slice(-500)}`)); });
  });
}
