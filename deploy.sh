#!/bin/bash
COMENT=$1
git add .
git commit -m "$COMENT"
git push origin 
echo $COMENT