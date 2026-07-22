import platform
import socket
import psutil


def get_system_info():
    return {
        "computer_name": socket.gethostname(),
        "operating_system": platform.system() + " " + platform.release(),
        "processor": platform.processor(),
        "cpu_cores": psutil.cpu_count(logical=False),
        "logical_processors": psutil.cpu_count(logical=True),
        "total_ram": round(psutil.virtual_memory().total / (1024 ** 3), 2)
    }


def get_storage_info():
    disks = []

    for partition in psutil.disk_partitions():
        try:
            usage = psutil.disk_usage(partition.mountpoint)

            disks.append({
                "drive": partition.device,
                "filesystem": partition.fstype,
                "total": round(usage.total / (1024 ** 3), 2),
                "used": round(usage.used / (1024 ** 3), 2),
                "free": round(usage.free / (1024 ** 3), 2),
                "percent": usage.percent
            })

        except PermissionError:
            continue

    return disks


def get_network_info():
    hostname = socket.gethostname()

    try:
        ip = socket.gethostbyname(hostname)
    except Exception:
        ip = "Unavailable"

    return {
        "hostname": hostname,
        "ip": ip
    }