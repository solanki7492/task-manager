import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Polyfill TextEncoder/TextDecoder for Node.js
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Enhanced Response.json() static method with proper body handling
if (!Response.json) {
  Response.json = function (data, init) {
    const jsonString = JSON.stringify(data);
    const response = new Response(jsonString, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });

    // Store the parsed data for easier testing
    response._jsonData = data;

    // Override json() method to return the data directly
    const originalJson = response.json.bind(response);
    response.json = async function () {
      try {
        return this._jsonData || (await originalJson());
      } catch (e) {
        return this._jsonData || {};
      }
    };

    return response;
  };
}
