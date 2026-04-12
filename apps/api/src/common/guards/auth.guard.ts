import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new UnauthorizedException('Authorization token is missing');
    }

    // 1. Validate JWT with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // 2. Fetch tenant_id and role from the 'users' table (Agent 08 Schema)
    const { data: userRecord, error: dbError } = await supabase
      .from('users')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (dbError || !userRecord) {
      console.error('AuthGuard: User not found in users table', dbError);
      throw new UnauthorizedException('User profile not found in multi-tenant system');
    }

    // 3. Inject context into the request for controllers to use
    request.userId = user.id;
    request.tenantId = userRecord.tenant_id;
    request.userRole = userRecord.role;

    return true;
  }
}
