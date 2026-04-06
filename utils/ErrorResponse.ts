export function ErrorResponse(message: string = "Not specified Error", status: number = 400, details: any = ''): Response {
    return Response.json(
        {success: false, error: message, details: details},
        { status }
    );
}
