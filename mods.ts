// @deno-types="https://cdn.sheetjs.com/xlsx-0.20.3/package/types/index.d.ts"
import xlsx from 'https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs'
import {
  objectByKeys,
  objects2object,
} from 'https://deno.land/x/yano3nora_tsutils@v0.29.0/main.ts'

export const excel2json = async (filePath: string, args: string[]) => {
  try {
    const leftkey = args.includes('--leftkey')
    const excel = await Deno.readFile(filePath)
    const workbook = xlsx.read(excel, { type: 'array' })
    const data = objectByKeys(
      workbook.SheetNames,
      (sheet) => {
        const keyName = workbook.Sheets[sheet]['A1']?.v

        if (!keyName || typeof keyName !== 'string') {
          return {}
        }

        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheet], {
          defval: null,
          raw: true,
          rawNumbers: true,
          blankrows: false,
          skipHidden: false,
          header: 0,
        }).filter((row): row is Record<PropertyKey, unknown> => (
          typeof row === 'object' &&
          !Array.isArray(row) &&
          row !== null
        )).map((row) => {
          Object.keys(row).forEach((k) => {
            if (
              k === '' ||
              k === null ||
              k === undefined ||
              k.startsWith('_')
            ) {
              delete row[k]
            }
          })

          return row
        }).filter((row) => Object.keys(row).length)

        const records = objects2object(rows, keyName)

        if (!leftkey) {
          Object.values(records).forEach((record) => delete record[keyName])
        }

        return records
      },
    )

    return JSON.stringify(data, null, 2)
  } catch (error) {
    console.error('[PARSE ERROR]', error)
  }
}

export const saveJson = async (json: string, filepath: string) => {
  try {
    await Deno.writeTextFile(filepath, json)
  } catch (error) {
    console.error('[WRITE ERROR]', error)
  }
}
