#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import axios from "axios";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const apiLink = "https://co.wuk.sh/"
const api = axios.create({
    baseURL: apiLink,
});

program
  .version("1.0.0")
  .description("Unofficial Cobalt CLI")
  .option("-l, --link <type>", "Link to youtube video")
  .option("-o, --output <type>", "Output file path")
  .action((options) => {
    api.post('/api/json', {
        url: options.link
    }, {
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        }
    }).then(data => {
        const streamUrl = data.data.url;

        // Download from the stream url
        api.get(streamUrl, {
            responseType: 'stream'
        }).then(response => {
            const path = `${__dirname}/${options.output}`
            const writer = fs.createWriteStream(path);
            response.data.pipe(writer);

            writer.on('finish', () => {
                console.log(chalk.green("Downloaded successfully!", `Saved to ${path}`));
            });

            writer.on('error', (err) => {
                console.log(chalk.red("Error: " + err));
            });
        }).catch(err => {
            console.log(chalk.red("Error: " + err));
        });
    })
  });

program.parse(process.argv);