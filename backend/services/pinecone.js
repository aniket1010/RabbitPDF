const { Pinecone } = require('@pinecone-database/pinecone');

// Enhanced Pinecone configuration with better error handling and timeouts
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
    maxRetries: 3
});

const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

// Retry configuration - optimized for performance
const RETRY_CONFIG = {
    maxRetries: 3, // Keep retries for resilience
    baseDelay: 500, // Slightly longer base delay for network issues
    maxDelay: 3000, 
    backoffMultiplier: 2 
};

// Exponential backoff retry function
async function retryWithBackoff(operation, operationName = 'operation') {
    let lastError;
    
    for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            
            const isRetryable = isRetryableError(error);
            
            if (!isRetryable || attempt === RETRY_CONFIG.maxRetries) {
                console.error(`❌ ${operationName} failed after ${attempt} attempts:`, error.message);
                throw error;
            }
            
            const delay = Math.min(
                RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
                RETRY_CONFIG.maxDelay
            );
            
            console.log(`⚠️ ${operationName} failed (attempt ${attempt}/${RETRY_CONFIG.maxRetries}), retrying in ${delay}ms...`);
            console.log(`   Error: ${error.message}`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError;
}

// Check if error is retryable
function isRetryableError(error) {
    const retryableErrors = [
        'Connect Timeout Error',
        'Request failed to reach Pinecone',
        'network problems',
        'UND_ERR_CONNECT_TIMEOUT',
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND',
        '502', // Bad Gateway
        '503', // Service Unavailable
        '504', // Gateway Timeout
    ];
    
    const errorMessage = error.message.toLowerCase();
    return retryableErrors.some(retryableError => 
        errorMessage.includes(retryableError.toLowerCase())
    );
}

// Test connection function
async function testPineconeConnection() {
    try {
        const testResponse = await retryWithBackoff(async () => {
            return await index.query({
                vector: Array(1536).fill(0), // 1536 dimensions for text-embedding-3-small
                topK: 1,
                includeMetadata: false
            });
        }, 'Pinecone connection test');
        
        return true;
    } catch (error) {
        console.error('❌ Pinecone connection failed:', error.message);
        return false;
    }
}

// **OPTIMIZED BATCH UPSERT FUNCTION**
async function batchUpsertEmbeddings(vectorDataArray) {
    const startTime = Date.now();
    
    // According to Pinecone docs, optimal batch size is around 100-200 for 1536-dim vectors.
    const optimalBatchSize = 100;
    const batches = [];

    // Split the total array into smaller, optimized batches
    for (let i = 0; i < vectorDataArray.length; i += optimalBatchSize) {
        batches.push(vectorDataArray.slice(i, i + optimalBatchSize));
    }

    // Create a promise for each batch upsert with timing
    const batchPromises = batches.map((batch, i) => {
        const formattedVectors = batch.map(item => ({
            id: item.id,
            values: item.vector,
            metadata: {
                text: item.text,
                chunkId: item.id,
                conversationId: item.conversationId,
                pageNumber: item.pageNumber || 1,
                pageType: item.pageType || 'content',
                tocConfidence: item.tocConfidence || 0,
                pagePosition: item.pagePosition || 0,
                // Enhanced metadata for better reference accuracy
                positionType: item.positionType || 'fallback',
                confidence: item.confidence || 0.5,
                contextBefore: item.contextBefore || '',
                contextAfter: item.contextAfter || '',
                chunkIndex: item.chunkIndex || 0,
                matchStartChar: item.matchStartChar || 0,
                matchEndChar: item.matchEndChar || (item.text ? item.text.length : 0)
            }
        }));

        // Use retry logic for each individual batch promise
        return retryWithBackoff(
            async () => {
                return await index.upsert(formattedVectors);
            },
            `Pinecone batch upsert ${i + 1}/${batches.length}`
        );
    });

    try {
        // **Execute all batch upsert promises in parallel**
        await Promise.all(batchPromises);
    } catch (error) {
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error(`❌ [Pinecone] Batch upsert failed after ${totalTime}s:`, error);
        // Re-throw the error to be caught by the calling background process
        throw error;
    }
}


async function queryEmbedding(vector, topK = 5, conversationId = null) {
    try {
        const queryOptions = {
            vector,
            topK,
            includeMetadata: true
        };

        if (conversationId) {
            queryOptions.filter = {
                conversationId: { $eq: conversationId }
            };
        }

        const queryResponse = await retryWithBackoff(async () => {
            return await index.query(queryOptions);
        }, 'Pinecone query');

        return queryResponse.matches;
    } catch (error) {
        console.error('❌ Error querying vectors:', error.message);
        if (error.message.includes('dimension')) {
            console.error('📏 Dimension mismatch - your Pinecone index dimension does not match your embedding model');
        }
        return [];
    }
}

async function deleteEmbeddings(conversationId) {
    // This function remains largely the same, but it's good practice
    // to use the filter API for deletions when possible.
    try {
        await retryWithBackoff(
            () => index.deleteMany({ conversationId: conversationId }),
            `Pinecone delete for conversation ${conversationId}`
        );
    } catch (error) {
        // Pinecone might throw an error if the filter matches no vectors.
        // We can safely ignore this or log it as a warning.
        if (error.message.includes("no vectors found")) {
            // Silently ignore - no embeddings to delete
        } else {
            console.warn('[Pinecone] Warning: Error deleting vectors:', error.message);
        }
    }
}

module.exports = {
    batchUpsertEmbeddings,
    queryEmbedding,
    deleteEmbeddings,
    testPineconeConnection
};
