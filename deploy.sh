#!/bin/bash
comment=$1
git add .
git commit -m 'from bash'
git push origin 
echo comment