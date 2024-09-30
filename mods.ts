// @deno-types="https://cdn.sheetjs.com/xlsx-0.20.3/package/types/index.d.ts"
import xlsx from 'https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs'
import {
  objectByKeys,
  objects2object,
} from 'https://deno.land/x/yano3nora_tsutils@v0.29.0/main.ts'

export const excel2json = async (filePath: string) => {
  try {
    const excel = await Deno.readFile(filePath)
    const workbook = xlsx.read(excel, { type: 'array' })
    const data = objectByKeys(
      workbook.SheetNames,
      (sheet) => (
        objects2object(
          xlsx.utils.sheet_to_json(workbook.Sheets[sheet], {
            defval: null,
            raw: true,
            rawNumbers: true,
          }) as Record<
            string,
            unknown
          >[],
          workbook.Sheets[sheet]['A1'].v,
        )
      ),
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
