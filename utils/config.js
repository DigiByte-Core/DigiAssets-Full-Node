var ini = require('iniparser')
var _ = require('lodash')
var path = require('path-extra')
var ospath = require('ospath')
var cp = require('child_process')

var tryPopulateDigiByteConfAuto = function (properties) {
  var digibytedConfPath = process.platform === 'linux' ? path.join(ospath.home(), '.digibyte', 'digibyte.conf') : path.join(ospath.data(), 'DigiByte', 'digibyte.conf')
  var digibytedProperties
  try {
    digibytedProperties = ini.parseSync(digibytedConfPath)
  } catch (e) { 
    console.warn('Can\'t find digibyted properties file for auto config:', digibytedConfPath)
    return false
  }
  if (!digibytedProperties) return false
  // console.log('bitcoindProperties', bitcoindProperties)
  // properties.network = (bitcoindProperties.testnet === '1' || bitcoindProperties === 'true') ? 'testnet' : 'mainnet'
  properties.digibyteHost = 'localhost'
  properties.digibytePort = digibytedProperties.rpcport || (properties.network === 'testnet' ? '14023' : '14022')
  properties.digibyteUser = digibytedProperties.rpcuser || 'rpcuser'
  properties.digibytePass = digibytedProperties.rpcpassword || 'rpcpass'
  properties.digibytePath = '/'
  properties.digibyteTimeout = parseInt(digibytedProperties.rpctimeout || '30', 10) * 1000
}

var tryRunDigiBytedWin32 = function (properties) {
  var cwd = properties.digibytedExecutableDir || process.env.DIGIBYTED_EXECUTABLE_DIR || 'C:\\Program Files\\DigiByte\\daemon\\'
  var command = 'digibyted.exe'
  var args = ['--server', '--txindex']
  if (properties.network === 'testnet') {
    args.push('--testnet')
  }
  if (properties.digibytedAutoConf && !properties.digibytedAutoConfSuccess) {
    // could not pull bitcoin properties (bitcoin.conf) to self properties - run bitcoin RPC server with defaults
    args.push('-rpcuser=' + properties.digibyteUser)
    args.push('-rpcpassword=' + properties.digibytePass)
    args.push('-rpcport=' + properties.digibytePort)
  }
  var spawn = cp.spawn
  var digibyted = spawn(command, args, {cwd: cwd})

  // bitcoind.stdout.on('data', function (data) {
  //   console.log('bitcoind:', data.toString())
  // })

  digibyted.stderr.on('data', function (data) {
    console.error('digibyted error:', data.toString())
  })

  digibyted.on('close', function (code) {
    if (code == 0 || code == 2) return
    console.error('digibyted closed with code,', code)
  })

  digibyted.on('error', function (code) {
    if (code == 0 || code == 2) return
    console.error('digibyted exited with error code,', code)
  })

  return true
}

var tryRunDigiBytedMac, tryRunDigiBytedLinux
tryRunDigiBytedMac = tryRunDigiBytedLinux = function (properties) {
  var command = 'digibyted'
  var args = ['--server', '--txindex']
  if (properties.network === 'testnet') {
    args.push('--testnet')
  }
  if (properties.digibytedAutoConf && !properties.digibytedAutoConfSuccess) {
    // could not pull bitcoin properties (bitcoin.conf) to self properties - run bitcoin RPC server with defaults
    args.push('-rpcuser=' + properties.digibyteUser)
    args.push('-rpcpassword=' + properties.digibytePass)
    args.push('-rpcport=' + properties.digibytePort)
  }
  var spawn = cp.spawn
  var digibyted = spawn(command, args)

  // bitcoind.stdout.on('data', function (data) {
  //   console.log('bitcoind:', data.toString())
  // })

  digibyted.stderr.on('data', function (data) {
    console.error('digibyted error:', data.toString())
  })

  digibyted.on('close', function (code) {
    if (code == 0 || code == 2) return
    console.error('digibyted closed with code,', code)
  })

  digibyted.on('error', function (code) {
    if (code == 0 || code == 2) return
    console.error('digibyted exited with error code,', code)
  })

  return true
}

var tryRunDigiByted = function (properties) {
  switch (this.__platform || process.platform) {
    case 'win32': 
      return tryRunDigiBytedWin32(properties)
    case 'darwin': 
      return tryRunDigiBytedMac(properties)
    default: 
      return tryRunDigiBytedLinux(properties)
  }
}

var tryRunRedisWin32 = function (properties) {
  var cwd = properties.redisExecutableDir || process.env.REDIS_EXECUTABLE_DIR || 'C:\\Program Files\\Redis'
  var command = 'redis-server.exe'
  var args = []
  var spawn = cp.spawn
  var redis = spawn(command, args, {cwd: cwd})

  // redis.stdout.on('data', function (data) {
  //   console.log('redis:', data.toString())
  // })

  redis.stderr.on('data', function (data) {
    console.error('redis error:', data.toString())
  })

  redis.on('close', function (code) {
    if (code == 0 || code == 2) return
    console.error('redis closed with code,', code)
  })

  redis.on('error', function (code) {
    console.error('redis exited with error code,', code)
  })
}

var tryRunRedisMac, tryRunRedisLinux
tryRunRedisMac = tryRunRedisLinux = function (properties) {
  var command = 'redis-server'
  var spawn = cp.spawn
  var redis = spawn(command)

  // redis.stdout.on('data', function (data) {
  //   console.log('redis:', data.toString())
  // })

  redis.stderr.on('data', function (data) {
    console.error('redis error:', data.toString())
  })

  redis.on('close', function (code) {
    if (code == 0 || code == 2) return
    console.error('redis closed with code,', code)
  })

  redis.on('error', function (code) {
    if (code == 0 || code == 2) return
    console.error('redis exited with error code,', code)
  })
}

var tryRunRedis = function (properties) {
  switch (this.__platform || process.platform) {
    case 'win32': 
      return tryRunRedisWin32(properties)
    case 'darwin': 
      return tryRunRedisMac(properties)
    default: 
      return tryRunRedisLinux(properties)
  }
}

module.exports = function (propertiesFile) {
  var localPropertiesFile = path.join(__dirname ,'/../properties.conf')
  propertiesFile = propertiesFile || localPropertiesFile
  var properties = {}
  try {
    properties = ini.parseSync(propertiesFile)
  } catch (e) {
    console.warn('Can\'t find properties file:', propertiesFile)
    if (propertiesFile !== localPropertiesFile) {
      console.warn('Trying local properties file...')
      try {
        properties = ini.parseSync(localPropertiesFile)
      }
      catch (e) {
        console.warn('Can\'t find local properties file:', localPropertiesFile)
      }
    }
  }

  properties.redisHost = properties.redisHost || process.env.REDIS_HOST || 'localhost'
  properties.redisPort = properties.redisPort || process.env.REDIS_PORT || '6379'
  properties.redisPassword = properties.redisPassword || process.env.REDIS_PASSWORD

  properties.digibytedAutoConf = (properties.digibytedAutoConf || process.env.DIGIBYTED_AUTO_CONF === 'true')

  var digibytedAutoConfSuccess = false
  if (properties.digibytedAutoConf) {
    digibytedAutoConfSuccess = tryPopulateDigiByteConfAuto(properties)
  }

  if (!digibytedAutoConfSuccess) {
    properties.network = properties.network || process.env.NETWORK || 'testnet'
    properties.digibyteHost = properties.digibyteHost || process.env.DIGIBYTED_HOST || 'localhost'
    properties.digibytePort = properties.digibytePort || process.env.DIGIBYTED_PORT || '14023'
    properties.digibyteUser = properties.digibyteUser || process.env.DIGIBYTED_USER || 'rpcuser'
    properties.digibytePass = properties.digibytePass || process.env.DIGIBYTED_PASS || 'rpcpass'
    properties.digibytePath = properties.digibytePath || process.env.DIGIBYTED_PATH || '/'
    properties.digibyteTimeout = parseInt(properties.digibyteTimeout || process.env.DIGIBYTED_TIMEOUT || 30000, 10)
  }

  properties.digibytedAutoRun = (properties.digibytedAutoRun || process.env.DIGIBYTED_AUTO_RUN === 'true')

  if (properties.digibytedAutoRun) {
    tryRunDigiByted(properties)
  }
  properties.redisAutoRun = (properties.redisAutoRun || process.env.DIGIBYTED_AUTO_RUN === 'true')

  if (properties.redisAutoRun) {
    tryRunRedis(properties)
  }

  properties.server = properties.server || {}
  properties.server.httpPort = properties.server.httpPort || process.env.DAFULLNODE_HTTP_PORT || process.env.PORT || 8043 // Optional
  properties.server.httpsPort = properties.server.httpsPort || process.env.DAFULLNODE_HTTPS_PORT || 443 // Optional
  properties.server.host = properties.server.host || process.env.DAFULLNODE_HOST || '0.0.0.0' // Optional

  properties.server.usessl = (properties.server.usessl || process.env.DAFULLNODE_USE_SSL === 'true') // Optional
  properties.server.useBoth = (properties.server.useBoth || process.env.DAFULLNODE_USE_BOTH === 'true') // both HTTP and HTTPS - Optional
  properties.server.privateKeyPath = properties.server.privateKeyPath || process.env.DAFULLNODE_PRIVATE_KEY_PATH // Mandatory in case CCFULLNODE_USE_SSL or CCFULLNODE_USE_BOTH is true
  properties.server.certificatePath = properties.server.certificatePath || process.env.DAFULLNODE_CERTIFICATE_PATH // Mandatory in case CCFULLNODE_USE_SSL or CCFULLNODE_USE_BOTH is true

  properties.server.useBasicAuth = properties.server.useBasicAuth || (process.env.DAFULLNODE_USE_BASIC_AUTH === 'true') // Optional
  properties.server.userName = properties.server.userName || process.env.DAFULLNODE_USER // Manadatory in case CCFULLNODE_USE_BASIC_AUTH is true
  properties.server.password = properties.server.password || process.env.DAFULLNODE_PASS // Manadatory in case CCFULLNODE_USE_BASIC_AUTH is true

  return properties
}
