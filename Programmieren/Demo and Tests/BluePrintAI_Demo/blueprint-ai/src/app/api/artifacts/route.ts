import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { GeneratedArtifacts } from '@/types/artifacts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('Supabase URL or Service Role Key is missing in environment variables.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseServer = createClient<Database>(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Fetch project data
    const { data: projectData, error: projectError } = await supabaseServer
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      return NextResponse.json(
        { error: `Failed to fetch project: ${projectError.message}` },
        { status: 500 }
      );
    }

    // Fetch artifacts data
    const { data: artifactsData, error: artifactsError } = await supabaseServer
      .from('artifacts')
      .select('*')
      .eq('project_id', projectId);

    if (artifactsError) {
      console.error('Error fetching artifacts:', artifactsError);
      return NextResponse.json(
        { error: `Failed to fetch artifacts: ${artifactsError.message}` },
        { status: 500 }
      );
    }

    // Transform the data into the expected format
    const artifacts: GeneratedArtifacts = {
      userStories: artifactsData
        .filter(a => a.type === 'user_story')
        .map(a => ({
          id: a.id,
          content: a.content ?? '',
          is_locked: a.is_locked
        })),
      functionalRequirements: artifactsData
        .filter(a => a.type === 'func_req')
        .map(a => ({
          id: a.id,
          content: a.content ?? '',
          is_locked: a.is_locked
        })),
      nonFunctionalRequirements: artifactsData
        .filter(a => a.type === 'non_func_req')
        .map(a => ({
          id: a.id,
          content: a.content ?? '',
          is_locked: a.is_locked
        })),
      architectureSuggestions: artifactsData
        .filter(a => a.type === 'arch_suggestion')
        .map(a => ({
          id: a.id,
          content: a.content ?? '',
          is_locked: a.is_locked
        })),
      useCaseDiagram: artifactsData.find(a => a.type === 'use_case_diagram')?.content ?? ''
    };

    return NextResponse.json({ 
      project: projectData,
      artifacts 
    });
  } catch (error: unknown) {
    console.error('Unhandled error in /api/artifacts:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
