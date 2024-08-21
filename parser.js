
const path = require('path')
const fs = require('fs-extra')
const yaml = require('yaml');
const $RefParser = require('json-schema-ref-parser');

// Вспомогательная функция для сохранения оригинальных $ref
/**
 * 
 * @param {*} schema 
 * @param {string} refName 
 */
function addRefName(schema, refName) {
    
    if (schema && typeof schema === 'object' && !Array.isArray(schema)) {
        schema['$originalRef'] = refName;
        const split = refName.split('/')
        schema['refType'] = split[split.length - 1];
        
    }
}


function traverse(obj, parent) {
  if (obj && typeof obj === 'object') {
      for (const key in obj) {
          if (key === '$ref' && typeof obj[key] === 'string') {
              const refName = obj[key];
              addRefName(obj, refName);
          } else {
              traverse(obj[key], obj);
          }
      }
  }
}

async function dereferenceWithRefNames(swaggerDoc) {
    const parser = new $RefParser();

    try{
      const schema = await parser.parse(swaggerDoc)
      traverse(schema, null);
      return parser.dereference(schema)       
    } catch(err) {
      console.error('Ошибка при разрешении ссылок:', err);
    }
}

module.exports = { dereferenceWithRefNames}