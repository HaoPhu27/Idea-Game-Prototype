"""
build.py — GIU LAI CHO TUONG THICH. Ban chinh thuc la `node tools/build.mjs`.

Ly do doi: repo khong con phu thuoc Python (test/demo/selftest deu la Node), va
ban Python cu cat import bang regex mot dong nen lam hong bundle khi source co
import trai dai nhieu dong. File nay nay chi uy quyen sang bundler Node de hai
duong build khong the lech nhau.
"""
import subprocess
import sys
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.exit(subprocess.call(["node", "tools/build.mjs"]))
