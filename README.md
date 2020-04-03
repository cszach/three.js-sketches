# My three.js sketches

[website]: https://you-create.github.io/three.js-sketches

This repository contains my [three.js](https://threejs.org) sketches; basically,
anything I have created with the library that I find cool! They are all
displayed on :point_right: [this website][website] :point_left:.

## :star: Highlights

[**Visit the website**][website] to see all of my sketches! Here are just a 
selected few.

<table>
    <tr>
        <td style="text-align: center">
            <a href="https://you-create.github.io/three.js-sketches/posts/singularity">
                <img width="600" src="sketches/singularity/thumbnail.png" />
            </a>
        </td>
        <td style="text-align: left">
            A metaphysical space that evokes emotions to complement with
            solitude and depression.
        </td>
    </tr>
    <tr>
        <td style="text-align: center">
            <a href="https://you-create.github.io/three.js-sketches/posts/wall-of-donuts">
                <img width="600" src="sketches/wall-of-donuts/thumbnail.png" />
            </a>
        </td>
        <td style="text-align: left">
            Some gigantic donuts on a wall, literally.
        </td>
    </tr>
    <tr>
        <td style="text-align: center">
            <a href="https://you-create.github.io/three.js-sketches/posts/creative-flower-pot">
                <img width="600" src="sketches/creative-flower-pot/thumbnail.png" />
            </a>
        </td>
        <td style="text-align: left">
            A 3D version of the creative flower pot that I gave to one of my
            beloved teacher as a gift on Vietnamese Teachers' Day 2019.
        </td>
    </tr>
</table>

## :open_file_folder: Directory structure

- `sketches/`: My three.js sketches, one for each sub-directory
- `assets/`: Contains shared CSS files, fonts, textures, images, etc.
- `three.js/`: A portion of the three.js repository needed by the sketches
- `lib/`: Contains other shared libraries, frameworks, and JavaScript files
- `common/`: Contains templates
- `_data/`, `_layouts/`, `_posts`, `_config.yml`, `index.md`, `Gemfile`,
  `Gemfile.lock`: Directories and files that you know very well if you've ever
  worked with a Jekyll website
- `README.md`: The document you are reading
- The rest of the files at the root directory: Various configuration files used
  by Git, NPM, and what not

## :desktop_computer: Running locally

You can run the website locally if you want to (say, you've lost your Internet
connection and you are bored). Fire up a command line and get ready!

### Installing Ruby

The website is generated using [Jekyll](https://jekyllrb.com/). Jekyll is a Ruby
gem, so you need to have a Ruby development environment installed (see this
[page](https://jekyllrb.com/docs/installation/) to receive specific requirements
and guides). Once you've got that installed, you need to install the Bundler
gem - which is needed to install dependencies - with:

```shell
# Before you enter this command, you must have Ruby installed
gem install bundler
```

### Getting a copy of the repository and installing dependencies

```shell
git clone https://github.com/you-create/three.js-sketches.git # Clone the repository
cd three.js-sketches # Navigate into the repository's directory
bundle install --path bundle # Install dependencies required to build the website
```

### Running the website locally

Once you've got yourself a clone of the repository and installed the
dependencies, just navigate into the clone's directory and run:

```shell
bundle exec jekyll serve
```

Then open your web browser and go to <localhost:4000>. Stop running with Ctrl +
C. Every time you need to view the website locally, that is the only command you
have to execute.

### Updating the local clone

To get new sketches and latest updates, do:

```shell
git pull origin master
```

## :page_with_curl: Copyright

Copyright :copyright: Nguyen Hoang Duong (<you_create@protonmail.com>).

Currently the source code is not licensed and is meant for educational purposes.
See [this page](https://choosealicense.com/no-permission/) by GitHub to know
what you are supposed to do. However, I'm considering a Creative Commons
license, and I will make my final decision as soon as possible. You can suggest
a better license for this project by opening a new issue.

A number of sketches also use resources that are not mine. For any such sketch,
see the _Acknowledgements_ section of that sketch's page for attributions and
detailed licensing information.
