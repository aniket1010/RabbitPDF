require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function createIndex() {
    const indexName = process.env.PINECONE_INDEX_NAME || 'chatpdf-local';
    
    console.log('🌲 [Pinecone] Initializing client...');
    console.log(`📝 Index name: ${indexName}`);
    
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
    });

    try {
        // Check if index already exists
        console.log('🔍 Checking existing indexes...');
        const indexes = await pinecone.listIndexes();
        console.log('📋 Existing indexes:', indexes.indexes?.map(i => i.name) || []);
        
        const indexExists = indexes.indexes?.some(i => i.name === indexName);
        
        if (indexExists) {
            console.log(`✅ Index "${indexName}" already exists!`);
            
            // Get index details
            const indexInfo = await pinecone.describeIndex(indexName);
            console.log('📊 Index info:', JSON.stringify(indexInfo, null, 2));
            return;
        }

        // Create the index
        console.log(`🔨 Creating index "${indexName}"...`);
        console.log('   Dimensions: 1536 (for text-embedding-3-small)');
        console.log('   Metric: cosine');
        console.log('   Spec: serverless (aws, us-east-1)');
        
        await pinecone.createIndex({
            name: indexName,
            dimension: 1536,
            metric: 'cosine',
            spec: {
                serverless: {
                    cloud: 'aws',
                    region: 'us-east-1'
                }
            }
        });

        console.log(`✅ Index "${indexName}" created successfully!`);
        console.log('⏳ Note: Index may take a few minutes to be ready for use.');
        
        // Wait and check status
        console.log('🔄 Waiting for index to be ready...');
        let ready = false;
        let attempts = 0;
        
        while (!ready && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            attempts++;
            
            const status = await pinecone.describeIndex(indexName);
            console.log(`   Attempt ${attempts}: Status = ${status.status?.state || 'unknown'}`);
            
            if (status.status?.ready) {
                ready = true;
                console.log('✅ Index is ready!');
            }
        }
        
        if (!ready) {
            console.log('⚠️ Index creation started but not ready yet. Please wait a few minutes.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.message.includes('ALREADY_EXISTS')) {
            console.log('ℹ️ Index already exists, this is OK!');
        } else {
            throw error;
        }
    }
}

createIndex().then(() => {
    console.log('🎉 Done!');
    process.exit(0);
}).catch(err => {
    console.error('💥 Failed:', err);
    process.exit(1);
});

