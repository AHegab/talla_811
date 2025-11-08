import type { Route } from './+types/api.recommend-size';

export async function action({request}: Route.ActionArgs) {
  try {
    const body = await request.json() as {height: number; weight: number; gender: string};
    const {height, weight, gender} = body;

    // TODO: Implement actual size recommendation logic
    // This is a placeholder that returns a mock recommendation
    
    // Simple heuristic (replace with ML model or API call)
    let size = 'M';
    let confidence = 0.75;

    if (gender === 'male') {
      if (height < 170 && weight < 65) {
        size = 'S';
        confidence = 0.8;
      } else if (height >= 170 && height < 180 && weight >= 65 && weight < 80) {
        size = 'M';
        confidence = 0.85;
      } else if (height >= 180 || weight >= 80) {
        size = 'L';
        confidence = 0.8;
      }
    } else if (gender === 'female') {
      if (height < 160 && weight < 55) {
        size = 'XS';
        confidence = 0.8;
      } else if (height >= 160 && height < 170 && weight >= 55 && weight < 65) {
        size = 'S';
        confidence = 0.85;
      } else if (height >= 170 && weight >= 65) {
        size = 'M';
        confidence = 0.8;
      }
    }

    return Response.json({
      size,
      confidence,
    });
  } catch (error) {
    console.error('Size recommendation error:', error);
    return Response.json(
      {error: 'Failed to calculate size recommendation'},
      {status: 500},
    );
  }
}
