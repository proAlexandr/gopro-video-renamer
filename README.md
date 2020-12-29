# gopro-video-renamer

It renames GoPro videos with format
`<year>-<month>-<day>_<hours>-<minutes>-<seconds> (<origin name>).mp4`

It ignores videos, which name doesn't follow GoPro default naming. (the script skip files which doesn't follow the mask `G???????.MP4`)

Example: `GH030030.MP4: => 2020-12-06_11-02-09 (GH030030).mp4`

Motivation is to sort videos by date order and include the
date to the file name in case if metadata is corrupted.

## Installation

Requirements:
* Node.js

Notes:
* It certainly works with nodejs v10.17.0.
* I have tested in with MacOS 10.15.7 and Windows 10

## Preparation

```shell
git clone git@github.com:proAlexandr/gopro-video-renamer.git
cd gopro-video-renamer
npm install
```

## Usage

```shell
node index.js <directory> <method>
```

* `<directory>` - path to a directory with videos.
* `<method>` - `gpmf` or `exif`.
  * `exif` extracts the date from `exif` file medatata. See: https://en.wikipedia.org/wiki/Exif
  * `gpmf` extracts the date from GPMF storage. Takes a lot of time since it has to parse the whole file. See https://github.com/gopro/gpmf-parser.


## Examples

```
node index.js /Users/promakh/Pictures/2020-12/100GOPRO gpmf
```

```
node index.js /Users/promakh/Pictures/2020-12/100GOPRO exif
```