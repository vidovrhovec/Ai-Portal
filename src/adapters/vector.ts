import { Pinecone } from '@pinecone-database/pinecone';
import { VectorConfig, VectorRecord, VectorSearchQuery, VectorSearchResult } from '../types';

export interface IVectorStoreAdapter {
  store(vectors: VectorRecord[]): Promise<void>;
  search(query: VectorSearchQuery): Promise<VectorSearchResult[]>;
}

class PineconeAdapter implements IVectorStoreAdapter {
  private client: Pinecone;
  private indexName: string;

  constructor(config: VectorConfig) {
    this.client = new Pinecone({
      apiKey: config.apiKey!,
    });
    this.indexName = config.indexName!;
  }

  async store(vectors: VectorRecord[]): Promise<void> {
    const index = this.client.index(this.indexName);
    // Filter out undefined metadata values to match Pinecone's RecordMetadata type
    const pineconeVectors = vectors.map(vector => ({
      ...vector,
      metadata: vector.metadata ? Object.fromEntries(
        Object.entries(vector.metadata).filter(([, value]) => value !== undefined)
      ) as Record<string, string | number | boolean | string[]> : undefined,
    }));
    await index.upsert(pineconeVectors);
  }

  async search(query: VectorSearchQuery): Promise<VectorSearchResult[]> {
    const index = this.client.index(this.indexName);
    const response = await index.query({
      vector: query.vector,
      topK: query.topK || 10,
      filter: query.filter,
    });
    return response.matches?.map(match => ({
      id: match.id,
      score: match.score || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata: match.metadata as Record<string, any>,
    })) || [];
  }
}

export class VectorStoreAdapterFactory {
  static createAdapter(config: VectorConfig): IVectorStoreAdapter {
    switch (config.provider) {
      case 'pinecone':
        return new PineconeAdapter(config);
      default:
        throw new Error(`Unsupported vector store: ${config.provider}`);
    }
  }
}

// Global instance
let vectorAdapter: IVectorStoreAdapter | null = null;

export const getVectorAdapter = (config: VectorConfig): IVectorStoreAdapter => {
  if (!vectorAdapter) {
    vectorAdapter = VectorStoreAdapterFactory.createAdapter(config);
  }
  return vectorAdapter;
};

export const switchVectorStore = (newConfig: VectorConfig): void => {
  vectorAdapter = VectorStoreAdapterFactory.createAdapter(newConfig);
};