#!/bin/bash

FEEDS=( daily weekly monthly)
for file in ${FEEDS[@]}
do
  wget -O ${PWD}/feed/$file.xml http://www.nicovideo.jp/ranking/fav/$file/vocaloid?rss=atom
done

