import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET(request, { params }) {
  const { path } = params;
  
  try {
    // Construct URL for static file
    const fileUrl = `${BACKEND_URL}/${path.join('/')}`;
    
    console.log(`Proxying static file request to: ${fileUrl}`);
    
    // Fetch the file from backend
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      console.error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      return new NextResponse('File not found', { status: 404 });
    }
    
    // Get the content type from backend response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Stream the file content
    const fileContent = await response.arrayBuffer();
    
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Static file proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
