import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

async function proxyRequest(request, { params }) {
  const { path } = params;
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();
  
  try {
    const url = `${BACKEND_URL}/${path.join('/')}${queryString ? `?${queryString}` : ''}`;
    
    const requestInit = {
      method: request.method,
      headers: {},
    };

    // Copy relevant headers from the original request
    const headersToProxy = [
      'authorization',
      'content-type',
      'accept',
      'user-agent',
      'accept-language',
      'accept-encoding'
    ];

    headersToProxy.forEach(headerName => {
      const headerValue = request.headers.get(headerName);
      if (headerValue) {
        requestInit.headers[headerName] = headerValue;
      }
    });

    // Set default content-type only if not already set
    if (!requestInit.headers['content-type']) {
      requestInit.headers['content-type'] = 'application/json';
    }

    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        // Handle FormData (multipart) differently from JSON
        const contentType = request.headers.get('Content-Type');
        
        if (contentType && contentType.includes('multipart/form-data')) {
          // For multipart/form-data, use formData() method
          const formData = await request.formData();
          requestInit.body = formData;
          requestInit.duplex = 'half'; // Required for streaming body
          // Remove Content-Type to let fetch handle boundary
          delete requestInit.headers['content-type'];
        } else {
          // For JSON or other text content
          const body = await request.text();
          if (body) {
            requestInit.body = body;
          }
        }
      } catch (error) {
        console.error('Error reading request body:', error);
      }
    }
    
    console.log(`Proxying ${request.method} request to: ${url}`);
    
    const response = await fetch(url, requestInit);
    
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    const responseInit = {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      }
    };

    if (contentType) {
      responseInit.headers['Content-Type'] = contentType;
    }
    
    return new NextResponse(
      contentType && contentType.includes('application/json') ? JSON.stringify(data) : data,
      responseInit
    );
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from backend', details: error.message }, 
      { status: 500 }
    );
  }
}

export async function GET(request, context) {
  return proxyRequest(request, context);
}

export async function POST(request, context) {
  return proxyRequest(request, context);
}

export async function PUT(request, context) {
  return proxyRequest(request, context);
}

export async function DELETE(request, context) {
  return proxyRequest(request, context);
}

export async function PATCH(request, context) {
  return proxyRequest(request, context);
}

export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
