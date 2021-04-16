const fs = require('fs-extra'),
    request = require('request'),
    https = require('https'),
    http = require('http')
    
const  _getProtocolFromUrl = function(url){
    return url.toLowerCase().startsWith('http://') ?
        http : https
}


/**
 * Downloads a file and saves it locally.
 */    
const downloadFile = async function (url, filePath){
    return new Promise(async function(resolve, reject){
        const file = fs.createWriteStream(filePath),
            protocol = _getProtocolFromUrl(url)

        protocol.get(url, function(response) {
            response.pipe(file)
            file.on('finish', function() {
                file.close(function(){
                    resolve()
                }) 
            })
        }).on('error', function(error) {
            // if download fails, delete file
            fs.unlink(filePath)
            reject(error)
        })

    })
}


/**
 * Gets HTTP status of an endpoint without downloading content
 */
const getStatus = async (url) =>{
    return new Promise(async function(resolve, reject){
        try {
            const protocol = _getProtocolFromUrl(url)
            protocol.get(url, (response) => {
                resolve(response.statusCode)
            }).on('error', (error) => {
                reject(error)
            })

        } catch (ex){
            reject (ex)
        }

    })
}


/** 
 * Async request. 
 */
const downloadString = async (options)=>{
    return new Promise((resolve, reject)=>{
        request( options, 
            (error, response) =>{
                if (error)
                    return reject(error)

                resolve(response)
            }
        )
    })
}


/**
 * Downloads the target url as JSON.
 */
const downloadJSON = async (url)=>{
    let raw = await downloadString(url)
    return JSON.parse(raw.body)
}


/**
 * 
 */
const post = async function(remoteUrl, body, requestOptions = {}){
    return new Promise(function(resolve, reject) {
        try {
            requestOptions.url = remoteUrl
            // allow method to be explicity overridden        
            requestOptions.method = requestOptions.method || 'POST'
            requestOptions.body = body

            request(requestOptions, 
                function(err, resp, body){
                    if (err)
                        return reject(err)
                        
                    resolve({ raw: resp, body : body})
                }
            )
           
        } catch(ex) {
            reject(ex)
        }
     })
}


/**
 * 
 */
const postUrlString = async function(remoteUrl, body, requestOptions = {}){
    requestOptions.headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    return await post(remoteUrl, body, requestOptions)
}


/**
 * 
 */
const delet = async function(remoteUrl, requestOptions = {}){
    return new Promise(function(resolve, reject) {
        try {
            requestOptions.url = remoteUrl
            requestOptions.method = 'DELETE'

            request(requestOptions, 
                function(err, resp, body){
                    if (err)
                        return reject(err)
                        
                    resolve({ raw: resp, body : body})
                }
            )
           
        } catch(ex) {
            reject(ex)
        }
     })
}


module.exports = {
    delete : delet,
    post,
    getStatus,
    postUrlString,
    downloadFile,
    downloadString,
    downloadJSON
}
