#!/bin/bash

set -e # exit on error
set -u # exit on undefined variable
# set -x # print commands
set -o pipefail # exit on command in a pipe failing

#read more at http://alimoeenysbrain.blogspot.com/2013/10/automatic-versioning-with-git-commit.html
#replace all stringBeanRadio with your project name
#for languages other than matlab replace all the .go extensions with your language extensions and modify BODY to reflect you language syntax
#for go (golang) see this gits: https://gist.github.com/alimoeeny/7005725

VERBASE=$(git rev-parse --verify HEAD | cut -c 1-7)
echo $VERBASE
NUMVER=$(awk '{printf("%s", $0); next}' src/happyVersion.js | sed 's/.*happy\.//' | sed 's/\..*//')
echo "old version: $NUMVER"
NEWVER=$(expr $NUMVER + 1)
BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "new version: happy.$NEWVER.$VERBASE"

BODY="export class happyVersion {\n\tString() {\n\t\treturn \"happy.$NEWVER.$BRANCH.$VERBASE\"\n\t}\n}\nexport default happyVersion;\n\n//"
printf "$BODY" > src/happyVersion.js
git add src/happyVersion.js

#BODY="package main\n\nfunc happyVersion() string {\n\treturn \"happy.$NEWVER.$BRANCH.$VERBASE\"\n}"
#echo $BODY > happyVersion.go
# printf "package main\n\nfunc happyVersion() string {\n\treturn \"happy.%s.%s.%s\"\n}" $NEWVER $BRANCH $VERBASE > happyVersion.go
# git add happyVersion.go
