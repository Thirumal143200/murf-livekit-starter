import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const scriptPath = path.join(process.cwd(), '../backend/src/db.py');
    // Ensure we handle paths correctly on Windows
    const { stdout } = await execAsync(`python "${scriptPath}" get_dashboard_stats`);
    const stats = JSON.parse(stdout);
    return Response.json(stats);
  } catch (error: any) {
    console.error('Failed to get dashboard stats:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const scriptPath = path.join(process.cwd(), '../backend/src/db.py');
    const { stdout } = await execAsync(`python "${scriptPath}" clear_call_log`);
    const res = JSON.parse(stdout);
    return Response.json(res);
  } catch (error: any) {
    console.error('Failed to clear call log:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}