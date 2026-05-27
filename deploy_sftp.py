#!/usr/bin/env python3
"""Deploy a local directory to a remote SFTP server.

Usage:
    python deploy_sftp.py

Required environment variables:
    SFTP_HOST     - SFTP server hostname
    SFTP_PORT     - SFTP server port
    SFTP_USER     - SFTP username
    SFTP_PASSWORD - SFTP password
    LOCAL_DIR     - Local directory to upload
    REMOTE_DIR    - Remote directory to upload to
"""

import os
import stat
import sys

import paramiko


def rm_rf(sftp, path):
    """Recursively remove all contents of a remote directory."""
    try:
        items = sftp.listdir_attr(path)
    except IOError:
        return

    for item in items:
        remote_path = f'{path}/{item.filename}'
        if stat.S_ISDIR(item.st_mode):
            rm_rf(sftp, remote_path)
            sftp.rmdir(remote_path)
            print(f'  Removed dir:  {remote_path}')
        else:
            sftp.remove(remote_path)
            print(f'  Removed file: {remote_path}')


def ensure_remote_dir(sftp, path):
    """Create a remote directory, ignoring errors if it already exists."""
    try:
        sftp.mkdir(path)
    except IOError:
        pass


def upload_dir(sftp, local, remote):
    """Recursively upload a local directory to a remote path."""
    ensure_remote_dir(sftp, remote)

    for item in sorted(os.listdir(local)):
        local_path = os.path.join(local, item)
        remote_path = f'{remote}/{item}'

        if os.path.isdir(local_path):
            upload_dir(sftp, local_path, remote_path)
        else:
            sftp.put(local_path, remote_path)
            print(f'  Uploaded: {remote_path}')


def main():
    host = os.environ['SFTP_HOST']
    port = int(os.environ['SFTP_PORT'])
    username = os.environ['SFTP_USER']
    password = os.environ['SFTP_PASSWORD']
    local_dir = os.environ['LOCAL_DIR']
    remote_dir = os.environ['REMOTE_DIR']

    if not os.path.isdir(local_dir):
        print(f"Error: local directory '{local_dir}' does not exist", file=sys.stderr)
        sys.exit(1)

    print(f'Connecting to {host}:{port} as {username}...')
    transport = paramiko.Transport((host, port))
    transport.connect(username=username, password=password)
    sftp = paramiko.SFTPClient.from_transport(transport)

    try:
        # Clean remote directory contents (but keep the directory itself)
        print(f'Cleaning remote directory: {remote_dir}')
        rm_rf(sftp, remote_dir)

        # Upload fresh content
        file_count = sum(len(files) for _, _, files in os.walk(local_dir))
        print(f"Uploading {file_count} files from '{local_dir}' to '{remote_dir}'...")
        upload_dir(sftp, local_dir, remote_dir)

        print('Deploy complete!')
    finally:
        sftp.close()
        transport.close()


if __name__ == '__main__':
    main()
