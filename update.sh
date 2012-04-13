#!/bin/bash

FEEDS=( daily weekly monthly)
for file in ${FEEDS[@]}
do
  wget -O $HOME/Dropbox/Public/vocalo/feed/$file.xml http://www.nicovideo.jp/ranking/fav/$file/vocaloid?rss=atom
done

