const fs = require('fs');
const { processCSV } = require('./src/lib/importer');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const csvContent = fs.readFileSync('../expenses_export.csv', 'utf8');
  
  const group = await prisma.group.create({ data: { name: "Test Group" } });
  
  try {
    const result = await processCSV(csvContent, group.id);
    console.log("Success!", result.anomalies.length, "anomalies detected.");
    console.log(result.anomalies);
  } catch (err) {
    console.error("Error:", err);
  }
}
main();
