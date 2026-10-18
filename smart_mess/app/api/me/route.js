import { auth } from '@/lib/auth';
import { apiError } from '@/lib/utils';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return apiError('Unauthorized', 401);
  }
  return Response.json({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    studentId: session.user.studentId,
  });
}
