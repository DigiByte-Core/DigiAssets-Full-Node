# DigiAssets Full-Node

[![npm version](https://badge.fury.io/js/coloredcoins-full-node.svg)](http://badge.fury.io/js/coloredcoins-full-node)
[![Slack channel](http://slack.coloredcoins.org/badge.svg)](http://slack.coloredcoins.org)

* This module, coupled with [digibyte-core](https://digibyte.io) reference client, will add the digiasset layer to digibyte transactions and their inputs \ outputs.
* It will expose the same api as the reference client with an addition of `assets` array on each transaction input \ output.
* It will enable a user to setup an easy to deploy digiassets full node with relatively short parsing time with low disk \ memory space.
* It will replace the heavy [DigiAssets Block Explorer](https://github.com/DigiByte-core/DigiAssets-Block-Explorer) for most use-cases.

### Dependencies:
* [bitcoin-core](https://bitcoin.org).
* [redis](https://redis.io).
