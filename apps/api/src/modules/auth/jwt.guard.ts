import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { supabase } from '../../infrastructure/supabase/supabase.client';

@Injectable()
export class JwtGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new UnauthorizedException('Authorization token is missing');
    }

    try {
      // 1. Validate JWT with Supabase Auth
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // 2. Fetch tenant_id and role from the 'users' table
      const { data: userRecord, error: dbError } = await supabase
        .from('users')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();

      if (dbError || !userRecord) {
        throw new UnauthorizedException('User profile not found');
      }

      // 3. Inject context
      request.userId = user.id;
      request.tenantId = userRecord.tenant_id;
      request.userRole = userRecord.role;

      return true;
    } catch (err) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
