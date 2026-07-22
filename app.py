from flask import Flask, render_template
from flask import request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from reportlab.pdfgen import canvas
from flask import send_file
import os
import psutil
import platform
import socket
import time
import winreg


app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///monitor.db"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


db = SQLAlchemy(app)

class Performance(db.Model):

    id = db.Column(
        db.Integer,
        primary_key=True
    )


    cpu = db.Column(
        db.Float
    )


    ram = db.Column(
        db.Float
    )


    time = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )
# ==========================
# SYSTEM INFORMATION
# ==========================

def get_system():

    return {

        "os": platform.system(),

        "version": platform.version(),

        "machine": platform.machine()

    }




# ==========================
# CPU INFORMATION
# ==========================

def get_cpu():

    return {

        "processor": platform.processor(),

        "usage": psutil.cpu_percent(interval=1),

        "cores": psutil.cpu_count()

    }





# ==========================
# RAM INFORMATION
# ==========================

def get_ram():

    memory = psutil.virtual_memory()


    return {

        "total": round(memory.total / (1024**3),2),

        "used": round(memory.used / (1024**3),2),

        "free": round(memory.available / (1024**3),2),

        "percent": memory.percent

    }




# ==========================
# STORAGE INFORMATION
# ==========================

def get_storage():

    drives=[]


    for partition in psutil.disk_partitions():

        try:

            usage = psutil.disk_usage(partition.mountpoint)


            drives.append({

                "drive": partition.device,

                "total": round(usage.total/(1024**3),2),

                "used": round(usage.used/(1024**3),2),

                "free": round(usage.free/(1024**3),2)

            })


        except PermissionError:

            pass


    return drives






# ==========================
# NETWORK INFORMATION
# ==========================

def get_network():


    hostname = socket.gethostname()


    ip = socket.gethostbyname(hostname)


    return {

        "hostname": hostname,

        "ip": ip

    }





# ==========================
# BATTERY INFORMATION
# ==========================

def get_battery():

    battery = psutil.sensors_battery()


    if battery:

        return {

            "status":
            "Charging" if battery.power_plugged else "Not Charging",

            "percent": battery.percent

        }


    else:

        return {

            "status":"Desktop",

            "percent":0

        }





# ==========================
# DASHBOARD ROUTE
# ==========================

@app.route("/")

def dashboard():


    return render_template(

        "index.html",

        system=get_system(),

        cpu=get_cpu(),

        ram=get_ram(),

        battery=get_battery(),

        storage=get_storage(),

        network=get_network()

    )
@app.route("/api/system")
def system_api():


    cpu = psutil.cpu_percent(interval=1)

    ram = psutil.virtual_memory().percent



    record = Performance(

        cpu=cpu,

        ram=ram

    )


    db.session.add(record)

    db.session.commit()



    return {


        "cpu":cpu,

        "ram":ram

    }

@app.route("/api/history")
def history():


    records = Performance.query.order_by(

        Performance.id.desc()

    ).limit(50).all()



    return {


        "cpu":[

            r.cpu for r in records[::-1]

        ],


        "ram":[

            r.ram for r in records[::-1]

        ],


        "time":[

            r.time.strftime("%H:%M:%S")

            for r in records[::-1]

        ]

    }

    cpu = psutil.cpu_percent(interval=1)

    ram = psutil.virtual_memory().percent


    return {

        "cpu": cpu,

        "ram": ram

    }

# ==========================
# Store computers
# ==========================


machines = []
@app.route("/api/register", methods=["POST"])
def register():

    data = request.json


    machines.append(data)


    return {

        "status":"registered"

    }



@app.route("/machines")
def machine_page():


    return render_template(

        "machines.html",

        machines=machines

        

    )




boot_time = psutil.boot_time()
def get_uptime():

    uptime_seconds = time.time() - boot_time


    hours = int(uptime_seconds // 3600)

    minutes = int((uptime_seconds % 3600) // 60)


    return {

        "hours": hours,

        "minutes": minutes

    }


def get_battery():

    battery = psutil.sensors_battery()


    if battery:

        return {

            "percent": battery.percent,

            "charging": battery.power_plugged

        }


    return {

        "percent":"N/A",

        "charging":False

    }


def get_temperature():

    try:

        temps = psutil.sensors_temperatures()

        if temps:

            for name, entries in temps.items():

                if entries:

                    return entries[0].current


    except AttributeError:

        return "Not Available"


    return "Not Available"

def get_processes():


    processes=[]


    for process in psutil.process_iter(
        ['name','cpu_percent']
    ):


        try:


            processes.append({

                "name":
                process.info['name'],


                "cpu":
                process.info['cpu_percent']

            })


        except:

            pass



    return processes[:10]


@app.route("/api/advanced")
def advanced():

    return {


        "uptime":
        get_uptime(),


        "battery":
        get_battery(),


        "temperature":
        get_temperature(),


        "processes":
        get_processes()

    }
@app.route("/api/alerts")
def alerts():

    cpu = psutil.cpu_percent(interval=1)

    ram = psutil.virtual_memory().percent


    messages = []


    if cpu > 80:

        messages.append(
            "⚠️ High CPU Usage"
        )


    if ram > 85:

        messages.append(
            "⚠️ High RAM Usage"
        )



    for disk in psutil.disk_partitions():

        try:

            usage = psutil.disk_usage(
                disk.mountpoint
            )


            if usage.percent > 90:

                messages.append(
                    "⚠️ Low Storage Space: "
                    + disk.device
                )


        except:

            pass



    return {

        "alerts":messages

    }



@app.route("/report")
def report():


    filename="system_report.pdf"


    path=os.path.join(
        filename
    )


    pdf=canvas.Canvas(path)



    pdf.drawString(
        100,
        750,
        "System Monitoring Report"
    )


    pdf.drawString(
        100,
        700,
        "Hostname: "
        +
        socket.gethostname()
    )


    pdf.drawString(
        100,
        650,
        "CPU Usage: "
        +
        str(psutil.cpu_percent())
        +
        "%"
    )


    pdf.drawString(
        100,
        600,
        "RAM Usage: "
        +
        str(psutil.virtual_memory().percent)
        +
        "%"
    )


    pdf.save()



    return send_file(path)
def get_installed_software():

    software = []


    registry_paths = [

        r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",

        r"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"

    ]


    for path in registry_paths:

        try:

            key = winreg.OpenKey(

                winreg.HKEY_LOCAL_MACHINE,

                path

            )


            for i in range(winreg.QueryInfoKey(key)[0]):

                try:

                    subkey_name = winreg.EnumKey(
                        key,
                        i
                    )


                    subkey = winreg.OpenKey(
                        key,
                        subkey_name
                    )


                    name = winreg.QueryValueEx(
                        subkey,
                        "DisplayName"
                    )[0]


                    try:

                        publisher = winreg.QueryValueEx(
                            subkey,
                            "Publisher"
                        )[0]

                    except:

                        publisher = "Unknown"



                    try:

                        version = winreg.QueryValueEx(
                            subkey,
                            "DisplayVersion"
                        )[0]

                    except:

                        version = "Unknown"



                    software.append({

                        "name":name,

                        "publisher":publisher,

                        "version":version

                    })


                except:

                    pass


        except:

            pass


    return software

@app.route("/api/software")
def software_api():

    return {

        "software":
        get_installed_software()

    }
def get_processes():

    processes=[]


    for p in psutil.process_iter(
        ['name','cpu_percent']
    ):

        try:

            processes.append({

                "name":
                p.info['name'],


                "cpu":
                p.info['cpu_percent']


            })


        except:

            pass



    return sorted(
        processes,
        key=lambda x:x["cpu"],
        reverse=True
    )[:10]

def get_login_history():

    users=[]


    for user in psutil.users():

        users.append({

            "name":
            user.name,


            "time":
            datetime.fromtimestamp(
            user.started
            ).strftime(
            "%H:%M:%S"
            )

        })


    return users


if __name__=="__main__":


    with app.app_context():

        db.create_all()


    app.run(debug=True)