// Google Drive sync engine handling appDataFolder

const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const BACKUP_FILENAME = "notesmith_backup.json";

interface DriveFile {
    id: string;
    name: string;
}

/**
 * Helper to fetch the existing backup file ID from the appDataFolder
 */
async function getBackupFileId(token: string): Promise<string | null> {
    const query = new URLSearchParams({
        spaces: 'appDataFolder',
        q: `name='${BACKUP_FILENAME}'`,
        fields: 'files(id, name)'
    });

    const res = await fetch(`${DRIVE_FILES_URL}?${query.toString()}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw new Error("Failed to query Google Drive");
    }

    const data = await res.json();
    const files = data.files as DriveFile[];
    return files.length > 0 ? files[0].id : null;
}

/**
 * Pushes the full app settings onto Google Drive.
 * @param token OAuth Access Token
 * @param appData The complete JSON object representing app state to backup
 */
export async function pushToDrive(token: string, appData: any): Promise<void> {
    const fileId = await getBackupFileId(token);
    const fileContent = JSON.stringify(appData, null, 2);

    const metadata = {
        name: BACKUP_FILENAME,
        parents: ['appDataFolder']
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(fileId ? {} : metadata)], { type: 'application/json' }));
    form.append('file', new Blob([fileContent], { type: 'application/json' }));

    const url = fileId
        ? `${DRIVE_UPLOAD_URL}/${fileId}?uploadType=multipart`
        : `${DRIVE_UPLOAD_URL}?uploadType=multipart`;

    const method = fileId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
        method,
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: form
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to upload to Google Drive: ${err}`);
    }
}

/**
 * Pulls the backup file from Google Drive if it exists
 * @param token OAuth Access Token
 * @returns The parsed JSON object of the backup, or null if no backup exists
 */
export async function pullFromDrive(token: string): Promise<any | null> {
    const fileId = await getBackupFileId(token);
    if (!fileId) return null;

    const res = await fetch(`${DRIVE_FILES_URL}/${fileId}?alt=media`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw new Error("Failed to download file from Google Drive");
    }

    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        throw new Error("Backup file in Google Drive is corrupted or invalid");
    }
}
