// Copy all data from one MongoDB to another, keeping _ids so links between records stay intact.
// Usage: node migrate.js <source-uri> <target-uri>
// Refuses to run if the target already has data in any of these collections.
import mongoose from 'mongoose';

const COLLECTIONS = ['categories', 'units', 'expenses', 'meta'];
const [source, target] = process.argv.slice(2);

if (!source || !target) {
  console.error('Usage: node migrate.js <source-uri> <target-uri>');
  process.exit(1);
}

const hidePassword = (uri) => uri.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@');

const src = await mongoose.createConnection(source).asPromise();
const dst = await mongoose.createConnection(target).asPromise();
console.log(`From: ${hidePassword(source)} (db: ${src.db.databaseName})`);
console.log(`To:   ${hidePassword(target)} (db: ${dst.db.databaseName})`);

for (const name of COLLECTIONS) {
  const existing = await dst.db.collection(name).countDocuments();
  if (existing) {
    console.error(`Target already has ${existing} document(s) in "${name}". Nothing was copied.`);
    process.exit(1);
  }
}

for (const name of COLLECTIONS) {
  const docs = await src.db.collection(name).find().toArray();
  if (docs.length) await dst.db.collection(name).insertMany(docs);
  const copied = await dst.db.collection(name).countDocuments();
  console.log(`${name}: ${docs.length} in source, ${copied} in target ${copied === docs.length ? '✓' : '✗ MISMATCH'}`);
}

await src.close();
await dst.close();
console.log('Done.');
