#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Modo God -- rotación semanal de contenido para Publish.

Qué hace: lee publish-rotation.json y, para la semana pedida (o la próxima si no se pasa nada),
agrega a publish-queue.json un SLOT vacío (status "draft", sin texto ni media, `slot: true`) por
cada entrada del ciclo. NO genera copy -- eso lo llena una corrida futura de om-marketing (o
alguien a mano), y recién ahí pasa por la aprobación de Roi como cualquier otro item de la cola.
Un slot vacío no se puede disparar: `post_discord()`/`youtube_upload_video()` rechazan texto+media
vacíos, así que no hay riesgo de que salga algo a medio llenar.

Idempotente: correrlo dos veces para la misma semana no duplica slots (el id incluye la fecha).

Arranca recién después de `rotation.starts_after` -- mientras la ventana de lanzamiento fechada en
MOBAWarmup/docs/social-content-calendar.md siga vigente, esa manda, no esto (ver publish-rotation.json).

    python publish_rotation.py                    -> genera slots para la semana que viene
    python publish_rotation.py --week 2026-08-24   -> semana que empieza ese lunes
    python publish_rotation.py --project moba-warmup

No corre solo -- nadie programó un cron acá a propósito (mismo criterio que asana-cache.json: el
refresco pasa cuando alguien lo dispara, no en segundo plano). Disparar esto es una tarea para el
arranque semanal de sesión de om-marketing o om-dev, documentada en README.md.
"""

import argparse
import json
import os
from datetime import date, datetime, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
ROTATION_PATH = os.path.join(HERE, "publish-rotation.json")
QUEUE_PATH = os.path.join(HERE, "publish-queue.json")

WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_queue(doc):
    tmp = QUEUE_PATH + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
        f.write("\n")
    os.replace(tmp, QUEUE_PATH)


def week_monday(d):
    return d - timedelta(days=d.weekday())


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--week", help="lunes de la semana a generar (YYYY-MM-DD). Default: el próximo lunes.")
    ap.add_argument("--project", default="moba-warmup", help="proyecto del registry al que pertenecen los slots.")
    args = ap.parse_args()

    rotation = load(ROTATION_PATH)
    starts_after = rotation.get("starts_after")

    if args.week:
        monday = datetime.strptime(args.week, "%Y-%m-%d").date()
    else:
        monday = week_monday(date.today()) + timedelta(days=7)

    if starts_after and monday.isoformat() < starts_after:
        print("La semana del {} es anterior a starts_after ({}) -- manda el calendario fechado de "
              "lanzamiento (docs/social-content-calendar.md), no la rotación. No genero nada."
              .format(monday, starts_after))
        return

    queue = load(QUEUE_PATH) if os.path.isfile(QUEUE_PATH) else {"items": []}
    existing_ids = {it["id"] for it in queue.get("items", [])}

    buckets = rotation.get("buckets", {})
    added = 0
    for entry in rotation.get("cycle", []):
        weekday = entry.get("weekday")
        bucket_name = entry.get("bucket")
        if weekday not in WEEKDAYS:
            continue
        bucket = buckets.get(bucket_name, {})
        day_date = monday + timedelta(days=WEEKDAYS.index(weekday))
        item_id = "slot-{}-{}-{}".format(args.project, bucket_name, day_date.isoformat())
        if item_id in existing_ids:
            continue
        queue.setdefault("items", []).append({
            "id": item_id,
            "project": args.project,
            "network": bucket.get("network"),
            "status": "draft",
            "text": "",
            "media_path": None,
            "target": {},
            "suggested_at": day_date.isoformat() + "T12:00:00-03:00",
            "source": bucket.get("source_hint", ""),
            "created_by": "publish_rotation.py",
            "created_at": date.today().isoformat(),
            "posted_at": None,
            "result": None,
            "slot": True,
            "bucket": bucket_name,
        })
        added += 1

    save_queue(queue)
    print("{} slot(s) agregados para la semana del {} (proyecto {}).".format(added, monday, args.project))


if __name__ == "__main__":
    main()
