// Export given data to excel

import * as Excel from 'exceljs';
import * as FileSaver from 'file-saver';

export default async function exportToExcel(data: any, header: any, report: string) {
    const name = `${
        report.toUpperCase()
    } - ${new Date().toLocaleDateString()}`

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    worksheet.columns = header;


    worksheet.addRows(data);
    workbook.xlsx.writeBuffer()
    .then(
        (data) => FileSaver.saveAs(new Blob([data]), name + '.xlsx')
    )
    .catch((error) =>{
        
    } );  
}


