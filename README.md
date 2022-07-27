<p align="center">
<img alt="Logo" src="./logo.png" width="50%">
</p>
<p align="center">
A simple online <a href="https://www.cardsagainsthumanity.com">Cards Against Humanity</a> clone written in python.
</p>

# Introduction

Cah.py is a web app written with Flask that lets you play the Cards Against Humanity card game through the internet. It has a user system with nicknames and avatars and provides a simple way to add custom card packs.

# Installation

### 1. Install python

Install python [here](https://www.python.org/downloads/). The app was tested and used with python `3.9.0`.

### 2. Clone or download this repo

If you have git installed run this command:
```
git clone https://github.com/loloToster/cah.py.git
```
or just click `Code > Download ZIP` at the top of the page and extract the downloaded file.

### 3. Install packages

In the root of the downloaded directory run:
```
pip install -r requirements.txt
```

# Usage

The app can be run like so:
```
python app.py
```
and it will be available under: `http://<host>:8080/` on the local network

## Running publicly

If you want to run the app publicly there is nothing holding you back but keep in mind that if you want to run the app for example with ngrok and preserve users accross multiple sessions (ngrok creates different url every time you restart it) you should use the `--domain` arg when launching the app and set it to the domain that should be used when setting the cookie. For example:

```
python app.py -d .eu.ngrok.io
```

will remeber users accross any url which domain ends with *.eu.ngrok.io*

## Adding custom cards

You can easily create custom cards by providing a special json file. The json file structure needs to look like this:
```js
{
    "packs": {
        [watermark_of_the_pack]: {
            "name": "The name of the pack",
            "icon": "[Optional] the url to the icon of the pack"
        },
        "EXMPL": {
            "name": "Example Pack",
            "icon": "/path/to/img.png"
        }
    },
    "black": [
        {
            "text": "The text of the black card",
            "watermark": "The watermark of the pack to which the card belongs",
            "pick": "[Optional: defaults to 1] How many cards a player has to pick",
            "draw": "[Optional: defaults to 0] Not working yet :("
        },
        {
            "text": "This is an example of ____.",
            "watermark": "EXMPL"
        }
    ],
    "white": [
        {
            "text": "The text of the white card",
            "watermark": "The watermark of the pack to which the card belongs"
        },
        {
            "text": "Example.",
            "watermark": "EXMPL"
        }
    ]
}
```
To format the text of the card you can use html. For example:

| `text` value | output |
|-|-|
| Some \<br> example \<i>text\</i>. | Some <br> example <i>text</i>. |

After creating your file you can load it when launching the app:
```
python app.py -c path/to/custom_cards.json
```
