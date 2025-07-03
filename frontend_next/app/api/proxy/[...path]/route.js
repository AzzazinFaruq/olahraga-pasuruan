import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://157.10.160.86:8080';

async function proxyRequest(request, { params }) {
  const { path } = params;
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();
  
  try {
    const url = `${BACKEND_URL}/${path.join('/')}${queryString ? `?${queryString}` : ''}`;
    
    const requestInit = {
      method: request.method,
      headers: {
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
      },
    };

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      requestInit.headers['Authorization'] = authHeader;
    }

    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const body = await request.text();
        if (body) {
          requestInit.body = body;
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
