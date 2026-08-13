import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function GET() {
    try {
        const scriptPath = path.join(process.cwd(), '../backend/src/db.py');
        // Ensure we handle paths correctly on Windows
        const { stdout } = await execAsync(`python "${scriptPath}" get_escalations_json`);
        const escalations = JSON.parse(stdout);
        return Response.json(escalations);
    } catch (error: any) {
        console.error('Failed to get escalations:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return Response.json({ error: 'Missing id parameter' }, { status: 400 });
        }
        const scriptPath = path.join(process.cwd(), '../backend/src/db.py');
        const { stdout } = await execAsync(`python "${scriptPath}" delete_ticket "${id}"`);
        const res = JSON.parse(stdout);
        return Response.json(res);
    } catch (error: any) {
        console.error('Failed to delete escalation:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;
        if (!id || !status) {
            return Response.json({ error: 'Missing id or status parameters' }, { status: 400 });
        }
        const scriptPath = path.join(process.cwd(), '../backend/src/db.py');
        const { stdout } = await execAsync(`python "${scriptPath}" update_status "${id}" "${status}"`);
        const res = JSON.parse(stdout);
        return Response.json(res);
    } catch (error: any) {
        console.error('Failed to update escalation status:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}