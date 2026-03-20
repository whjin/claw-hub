#!/usr/bin/env sh

# 提交至main主分支
git pull origin main
git add .
git commit -m "更新main分支"
git push origin main

# 按任意键关闭
echo "按任意键关闭"
read -n 1

# 关闭脚本
exit 0