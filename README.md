# ifmchain-js
  - get block hight from ifmchain
  - get comfirmd number by transaction id
  - get transaction by id
  - get transactions by params
  - create and put transactions to ifmchain

## install

    npm install ifmchain-js

## message format from ifmchain server
### the success data format
```sh
{success: true, /*some other data*/}
```

### the error data format
```sh
{success: false, /*some other error message*/}
```

## usage 

## set blockchain net environment(denpend on your connect server environment)
```sh 
var ifmchainJs = require('ifmchain-js')("testnet");//or mainnet
```

### connect to ifmchain net
- **url is mainnet.ifmchain.org while not input url, which net is main net**
```sh
var ifmchainJs = require('ifmchain-js')()
var url = "http://127.0.0.1:19000"; //the ifmchain url that your want to connect
var timeout = 2000; //connect timeout 
var httpProvider = new ifmchainJs.HttpProvider(url, timeout); //use http connect to ifmchain
var ifmchainApi = new ifmchainJs.Api(httpProvider);
```
### create a secret

- **the properties of ifmchain.Mnemonic.Words:**
```sh
CHINESE
ENGLISH
FRENCH
ITALIAN
JAPANESE
SPANISH

```

```sh

var secret = new ifmchain.Mnemonic(256, ifmchain.Mnemonic.Words.ENGLISH).toString();
```

### get user informationn

```sh

var keypair = ifmchainJs.keypairHelper.create(secret);

var address = ifmchainJs.addressCheck.generateBase58CheckAddress(keypair.publicKey);

ifmchainApi.account.getUserByAddress(address)
    .then(function(data){
        //success data: { success: true, account: Object }
    });

var username = "yourname";

ifmchainApi.account.getUserByUsername(username)
    .then(function(data){
        //success data: { success: true, account: Object }
    })
```

### get peers from ifmchain (all the param are optional)
 - **{String}** &nbsp;&nbsp; ip //such as 127.0.0.1
 - **{Number}** &nbsp;&nbsp;port 
 - **{Number}** &nbsp;&nbsp;state //0 means peer is wrong
 - **{String}** &nbsp;&nbsp;version
 - **{String}** &nbsp;&nbsp;os
  
#### properties of orderBy (all the properties are optional, and can be "desc" or "asc"):
```sh
    ip
    port
    state
    version
    os
```
```sh

var info = {
    ip: "127.0.0.1",
    port: 19003,
    oderBy: "ip:desc"
}

ifmchainApi.peer.getPeers(info)
    .then(function(data){
        //success data: { success: true, peers: [object] }
    });
```

### get block hight from ifmchain 

```sh
ifmchainApi.peer.getHeight()
    .then(function(data){
        //success data: { success: true, height: 8994 }
    });
```

### get block by id 
```sh
ifmchainApi.block.getBlockById(blockId)
    .then(function(data){
         //success data: { success: true, block: Object }
    })
```


### get blocks by params (all the param are optional)
 - **{Number}** &nbsp;&nbsp;offset //search the block height greater than offset 
 - **{Number}** &nbsp;&nbsp;height //search the block by height
 - **{Number}** &nbsp;&nbsp;limit //0 will search all, maximum is 100
 - **{Number}** &nbsp;&nbsp;version
 - **{Float}** &nbsp;&nbsp;totalAmount //TBD
 - **{Float}** &nbsp;&nbsp;totalFee //TBD
 - **{Float}** &nbsp;&nbsp;reward //TBD
 - **{String}** &nbsp;&nbsp;previousBlock //search the blcok by previous block
 - **{String}** &nbsp;&nbsp;generatorPublicKey //search the blcok by generator publicKey
 - **{String}** &nbsp;&nbsp;orderBy 
#### properties of orderBy (all the properties are optional, and can be "desc" or "asc"):
```sh
    id
    timestamp
    height
    previousBlock
    totalAmount
    totalFee
    generatorPublicKey

```

```sh
 var info = {
    limit: 1
}

ifmchainApi.block.getBlocks(info)
    .then(function(data){
        //success data: { success: true, blocks: [object] }
    })
```


### get transaction by id

```sh
ifmchainApi.transaction.getTransactionById(transactionId)
    .then(function(data){
        //success data: {success: true, transaction: Object}
        //false data: {"success":false,"error":{"message":"Transaction not found"}}
    });
```

### get transactions by params (all the param are optional)
 - **{String}** &nbsp;&nbsp;blockId
 - **{Number}** &nbsp;&nbsp;startHeight //minimum is 1
 - **{Number}** &nbsp;&nbsp;limit //0 will search all, maximum is 100
 - **{Number}** &nbsp;&nbsp;type //see the bottom of transaction type
 - **{PublicKey}** &nbsp;&nbsp;senderPublicKey 
 - **{String}** &nbsp;&nbsp;senderId //sender address
 - **{String}** &nbsp;&nbsp;recipientId //recipient address
 - **{String}** &nbsp;&nbsp;senderUsername //TBD
 - **{String}** recipientUsername //TBD
 - **{Float}** &nbsp;&nbsp;amount //TBD
 - **{Float}** &nbsp;&nbsp;fee //TBD
 - **{String}** &nbsp;&nbsp;orderBy 
#### properties of orderBy (all the properties are optional, and can be "desc" or "asc"):
```sh
    t_id
    t_type
    t_timestamp
    t_senderPublicKey
    t_senderId
    t_recipientId
    t_senderUsername //TBD
    t_recipientUsername //TBD
    t_amount 
    t_fee
    t_signature
    t_signSignature
```
#### get transactions
```sh
var data = {
    senderId: "c5YdF6Zj4vVUMvM48WujW5di13BQ3ChxQZ",
    startHeight: 11，
    orderBy: "t_timestamp:desc"
}
ifmchainApi.transaction.getTransactions(data)
    .then(function(data){
        //success data: {success: true, transaction: [Object]}
        //false data: {"success":false,"error":{"message":"Transaction not found"}}
    });
```

    
### create and put transactions to ifmchain

  - **transaction of transfer ibt** 
```sh
  var info = {
        type: ifmchainJs.transactionTypes.SEND, //transaction type
        secret: secret,
        // secondSecret: "paymentpassword", //Payment password
        publicKey: publicKey,   //sender publicKey 
        amount: amount, //the amount you want to trade, the minmum is  "0.00000001", and the type must be String
        fee: fee, //the minmum is  "0.00000001", the type must be String
        recipientId: recipientAddress //recipient  address
  }

  ifmchainApi.transaction.putTransaction(info, function(err, data){
        //success data： {success: true, transactionId: "813a04202873623c7d9650af1c3f4566797b35d0daa7ef094d…"}
        
  });
```


  - **transaction of set payment password** 
```sh
  var info = {
        type: ifmchainJs.transactionTypes.SIGNATURE, //transaction type
        secret: secret,
        //secondSecret: "paymentpassword", //Payment password
        publicKey: publicKey,   //sender publicKey 
        fee: fee, //the minmum is  "0.00000001", the type must be String
        asset: {
            signature: {
                publicKey: publicKey,   //sender publicKey
            }
        }
  }

  ifmchainApi.transaction.putTransaction(info, function(err, data){
         //success data： {success: true, transactionId: "813a04202873623c7d9650af1c3f4566797b35d0daa7ef094d…"}
  });
```

  - **transaction of register delegate** 
```sh
  var info = {
        type: ifmchainJs.transactionTypes.DELEGATE, //transaction type
        secret: secret,
        //secondSecret: "paymentpassword", //Payment password
        publicKey: publicKey,   //sender publicKey 
        fee: fee, //the minmum is  "0.00000001", the type must be String
        asset: {
            delegate: {
                username: "your name",
                publicKey: publicKey,   //sender publicKey 
            }
        }
  }
  ifmchainApi.transaction.putTransaction(info, function(err, data){
         //success data： {success: true, transactionId: "813a04202873623c7d9650af1c3f4566797b35d0daa7ef094d…"}
  });
```


  - **transaction of vote** 
```sh
  
  // the  publicKey of register
  var delegates = ['+'+register.publicKey];

  var info = {
        type: ifmchainJs.transactionTypes.VOTE, //transaction type
        secret: secret,
        //secondSecret: "paymentpassword", //Payment password
        publicKey: publicKey,   //sender publicKey 
        fee: fee, //the minmum is  "0.00000001", the type must be String
        asset: {
            votes: delegates
        }
  }

  ifmchainApi.transaction.putTransaction(info, function(err, data){
         //success data： {success: true, transactionId: "813a04202873623c7d9650af1c3f4566797b35d0daa7ef094d…"}
  });
```

  - **transaction of cancel voting** 
```sh
  
  // the  publicKey of register
  var delegates = ['-'+register.publicKey];

  var info = {
        type: ifmchainJs.transactionTypes.VOTE, //transaction type
        secret: secret,
        //secondSecret: "paymentpassword", //Payment password
        publicKey: publicKey,   //sender publicKey 
        fee: fee, //the minmum is  "0.00000001", the type must be String
        asset: {
            votes: delegates
        }
  }

  ifmchainApi.transaction.putTransaction(info, function(err, data){
         //success data： {success: true, transactionId: "813a04202873623c7d9650af1c3f4566797b35d0daa7ef094d…"}
  });
```

  - **transaction of set username** 
```sh
  
  var info = {
        type: ifmchainJs.transactionTypes.USERNAME, //transaction type
        secret: secret,
        //secondSecret: "paymentpassword", //Payment password
        publicKey: publicKey,   //sender publicKey 
        fee: fee, //the minmum is  "0.00000001", the type must be String
        asset: {
            username: {
                alias: "yourAlias",
                publicKey: publicKey //sender publicKey
            }
        }
  }

  ifmchainApi.transaction.putTransaction(info, function(err, data){
         //success data： {success: true, transactionId: "813a04202873623c7d9650af1c3f4566797b35d0daa7ef094d…"}
  });
```

  - **transaction of add contact** 
```sh
  
  var info = {
        type: ifmchainJs.transactionTypes.FOLLOW, //transaction type
        secret: secret,
        //secondSecret: "paymentpassword", //Payment password
        publicKey: publicKey,   //sender publicKey 
        fee: fee, //the minmum is  "0.00000001", the type must be String
        asset: {
            contact: {
                address: "+" + address //contact address
            }
        }
  }

  ifmchainApi.transaction.putTransaction(info, function(err, data){
         //success data： {success: true, transactionId: "813a04202873623c7d9650af1c3f4566797b35d0daa7ef094d…"}.
  });
```

## annotation

### account object
```sh
address:"cNi8GxVtcdVL7egb8XQmJZBsfYU3aTddnH"
balance:"22856045182624993"
multisignatures: []
publicKey:"cdfbd7588a91b5f4d531a12f940f9dd7cd46e256f7c4232036b9e7125b061d55"
secondPublicKey:""
secondSignature:false
u_multisignatures: []
unconfirmedBalance:"22856045182624993"
unconfirmedSignature:false
username:"11w"
```

### block object
```sh
blockSignature:"c3d1ad3b6b9ea474b052703a66211e7d56c2db17243a12717477d3435b421730f969506a58eca8215aca1bc7f7d6b5022df24f091655cabe80cc3a9934ba9805" //generator delegate sinature
confirmations:"2" //confirmations of block
generatorId:"cEmdMYp5xgtDBxpSrJcoAQPNDBQ7iAjoY5" //generator address
generatorPublicKey:"4ddfe3bbfc03e2be54301afc108e272a472acba2f59aa53265eea3cd683a365d" 
height:2975
id:"d1540a029144cc15f2e6eadc9f1fb5c128681690d0f61ebec7e0f2db841b5ec9" //block id
numberOfTransactions:1
payloadHash:"ffab0294fad69ef2031dc9671c8c4fdc21949a33701624c8bbf3e9e0ed5c1468"
payloadLength:152
previousBlock:"2ba86c13e5ab9d408d6badbf569115881d799687003ef7324dcb8169edeb7573" //the id of previous block
reward:"3500000000" 
timestamp:14120880
totalAmount:"222000000"
totalFee:"30000000"
totalForged:"3530000000" 
version:0
```

### transaction object

```sh
{
    type:0， //transaction type
    amount:"222000000",　//the ibt you want to transfer, and the basic unit is yao, 1 ibt = 100000000 yao
    blockId:"030a099fe8f7f77f4f0ab65820576b12e470c7ace3e7dc7532b1082794c62ad0", //block id 
    confirmations:"2", //confirmed number of block
    fee:"30000000", //service charge
    height:"452", //current block height
    id:"b1d899f5b1d859d3398c7d51eb02eb77230ad9e5b9338264f01c30d4ed8bb245", //transaction id
    recipientId:"c5nL4ZVRoF4cKGzLvzmjSzhJZtwj8kFECd", //recipient address 
    recipientUsername:"", //recipient username
    senderId:"cNi8GxVtcdVL7egb8XQmJZBsfYU3aTddnH", //sender address
    senderPublicKey:"cdfbd7588a91b5f4d531a12f940f9dd7cd46e256f7c4232036b9e7125b061d55", //sender publicKey
    senderUsername:"", //sender name
    signature:"24dfd951d95ccbabd1e1f79c4f70b9c19f15b157a29d76ed504c7ec2bf72ba1d2ce5f1a0b9b287945d54abd1419c19b8aa072bba690cb50463cf2579dbe54401",
    signSignature:"", //signature by payment password 
    timestamp:14001365
}
```
### transaction type
```sh
  1. ifmchainJs.transactionTypes.SEND(or 0): transfer ibt

  2. ifmchainJs.transactionTypes.SIGNATURE(or 1): set payment password

  3. ifmchainJs.transactionTypes.DELEGATE(or 2): register delegate, can only be set once

  4. ifmchainJs.transactionTypes.VOTE(or 3): vote to delegates

  5. ifmchainJs.transactionTypes.USERNAME(or 4): set username, can only be set once

  6. ifmchainJs.transactionTypes.FOLLOW(or 5): add contacts
```




  