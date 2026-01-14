import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { createServer } from 'http';
import request from 'supertest';
import { Express } from 'express';
import fs from 'fs';
import path from 'path';
import { createApp } from '../src/app.js';
import { prisma, connectDatabase, disconnectDatabase } from '../src/lib/prisma.js';

describe('Upload API', () => {
  let app: Express;
  const uploadedFiles: string[] = [];

  beforeAll(async () => {
    await connectDatabase();
    const httpServer = createServer();
    const result = createApp(prisma, httpServer);
    app = result.app;
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  afterEach(() => {
    // Clean up uploaded test files
    uploadedFiles.forEach(file => {
      const filePath = path.join('uploads', file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    uploadedFiles.length = 0;
  });

  describe('POST /api/upload', () => {
    it('should upload JPEG image successfully', async () => {
      const res = await request(app)
        .post('/api/upload')
        .attach('image', Buffer.from('fake-jpeg-data'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.url).toMatch(/^\/uploads\/[\w-]+\.jpg$/);

      // Track for cleanup
      const filename = res.body.data.url.split('/').pop();
      if (filename) uploadedFiles.push(filename);
    });

    it('should upload PNG image successfully', async () => {
      const res = await request(app)
        .post('/api/upload')
        .attach('image', Buffer.from('fake-png-data'), {
          filename: 'test.png',
          contentType: 'image/png',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.url).toMatch(/^\/uploads\/[\w-]+\.png$/);

      const filename = res.body.data.url.split('/').pop();
      if (filename) uploadedFiles.push(filename);
    });

    it('should upload WebP image successfully', async () => {
      const res = await request(app)
        .post('/api/upload')
        .attach('image', Buffer.from('fake-webp-data'), {
          filename: 'test.webp',
          contentType: 'image/webp',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.url).toMatch(/^\/uploads\/[\w-]+\.webp$/);

      const filename = res.body.data.url.split('/').pop();
      if (filename) uploadedFiles.push(filename);
    });

    it('should reject non-image file with 400', async () => {
      const res = await request(app)
        .post('/api/upload')
        .attach('image', Buffer.from('fake-pdf-data'), {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_FILE_TYPE');
      expect(res.body.error.message).toBe('Only JPEG, PNG, and WebP images are allowed');
    });

    it('should reject GIF file with 400', async () => {
      const res = await request(app)
        .post('/api/upload')
        .attach('image', Buffer.from('fake-gif-data'), {
          filename: 'test.gif',
          contentType: 'image/gif',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_FILE_TYPE');
    });

    it('should return 400 when no file provided', async () => {
      const res = await request(app)
        .post('/api/upload');

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('NO_FILE_PROVIDED');
    });

    it('should reject file larger than 5MB with 413', async () => {
      // Create a buffer larger than 5MB
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB

      const res = await request(app)
        .post('/api/upload')
        .attach('image', largeBuffer, {
          filename: 'large.jpg',
          contentType: 'image/jpeg',
        });

      expect(res.status).toBe(413);
      expect(res.body.error.code).toBe('FILE_TOO_LARGE');
      expect(res.body.error.message).toBe('File size exceeds maximum allowed (5MB)');
    });

    it('should save file with UUID filename', async () => {
      const res = await request(app)
        .post('/api/upload')
        .attach('image', Buffer.from('test-data'), {
          filename: 'original-name.jpg',
          contentType: 'image/jpeg',
        });

      expect(res.status).toBe(201);
      
      const filename = res.body.data.url.split('/').pop();
      expect(filename).toMatch(/^[\w-]+\.jpg$/);
      
      // Verify the filename is a UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/;
      expect(filename).toMatch(uuidRegex);

      if (filename) uploadedFiles.push(filename);
    });

    it('should actually create the file on disk', async () => {
      const res = await request(app)
        .post('/api/upload')
        .attach('image', Buffer.from('test-content'), {
          filename: 'disk-test.jpg',
          contentType: 'image/jpeg',
        });

      expect(res.status).toBe(201);
      
      const filename = res.body.data.url.split('/').pop();
      const filePath = path.join('uploads', filename!);
      
      expect(fs.existsSync(filePath)).toBe(true);
      
      if (filename) uploadedFiles.push(filename);
    });
  });

  describe('GET /uploads/:filename', () => {
    it('should serve uploaded file statically', async () => {
      // First upload a file
      const uploadRes = await request(app)
        .post('/api/upload')
        .attach('image', Buffer.from('static-test-data'), {
          filename: 'static-test.jpg',
          contentType: 'image/jpeg',
        });

      const filename = uploadRes.body.data.url.split('/').pop();
      
      // Then try to retrieve it
      const getRes = await request(app)
        .get(`/uploads/${filename}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.toString()).toBe('static-test-data');

      if (filename) uploadedFiles.push(filename);
    });
  });
});
