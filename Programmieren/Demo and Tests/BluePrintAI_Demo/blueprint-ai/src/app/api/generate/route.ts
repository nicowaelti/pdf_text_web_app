import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateArtifacts, generateTasks } from '@/lib/openai-client';
import { GeneratedArtifacts } from '@/types/artifacts';
import { Database } from '@/lib/database.types';

export async function POST(request: Request) {
  try {
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

    console.log('[API /generate] Received request');
    const { description } = await request.json();
    console.log('[API /generate] Description:', description ? description.substring(0, 50) + '...' : 'null');

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    console.log('[API /generate] Creating project and generating artifacts...');
    // Create project and generate artifacts in parallel
    const [projectResult, artifacts] = await Promise.all([
      supabaseServer
        .from('projects')
        .insert([{ name: description.substring(0, 50), description }])
        .select()
        .single(),
      generateArtifacts(description)
    ]);

    if (projectResult.error || !projectResult.data) {
      console.error('Error creating project:', projectResult.error);
      return NextResponse.json(
        { error: `Failed to create project: ${projectResult.error?.message}` },
        { status: 500 }
      );
    }

    const project = projectResult.data;
    console.log('[API /generate] Project created:', project.id);

    // Prepare artifacts for database insertion
    const artifactsToInsert = [
      ...artifacts.userStories.map(item => ({
        project_id: project.id,
        type: 'user_story',
        content: item.content,
        is_locked: false
      })),
      ...artifacts.functionalRequirements.map(item => ({
        project_id: project.id,
        type: 'func_req',
        content: item.content,
        is_locked: false
      })),
      ...artifacts.nonFunctionalRequirements.map(item => ({
        project_id: project.id,
        type: 'non_func_req',
        content: item.content,
        is_locked: false
      })),
      ...artifacts.architectureSuggestions.map(item => ({
        project_id: project.id,
        type: 'arch_suggestion',
        content: item.content,
        is_locked: false
      })),
      {
        project_id: project.id,
        type: 'use_case_diagram',
        content: artifacts.useCaseDiagram,
        is_locked: false
      }
    ];

    console.log('[API /generate] Inserting artifacts...');
    const { data: insertedArtifacts, error: artifactsError } = await supabaseServer
      .from('artifacts')
      .insert(artifactsToInsert)
      .select();

    if (artifactsError) {
      console.error('Error creating artifacts:', artifactsError);
      return NextResponse.json(
        { error: `Failed to create artifacts: ${artifactsError.message}` },
        { status: 500 }
      );
    }

    // Generate tasks based on the created artifacts
    console.log('[API /generate] Generating tasks...');
    if (!insertedArtifacts || insertedArtifacts.length === 0) {
      console.error('No artifacts were created');
      return NextResponse.json(
        { error: 'Failed to create artifacts: No artifacts were created' },
        { status: 500 }
      );
    }

    let createdTasks;
    try {
      const tasks = await generateTasks(project.id, insertedArtifacts[0].id, description);
      console.log('[API /generate] Generated tasks:', tasks);

      if (!tasks || tasks.length === 0) {
        console.error('No tasks were generated');
        return NextResponse.json(
          { error: 'Failed to generate tasks: No tasks were generated' },
          { status: 500 }
        );
      }

      // Create tasks in database
      console.log('[API /generate] Creating tasks in database...');
      const { data, error: tasksError } = await supabaseServer
        .from('tasks')
        .insert(tasks)
        .select();

      if (tasksError) {
        console.error('Error creating tasks:', tasksError);
        return NextResponse.json(
          { error: `Failed to create tasks: ${tasksError.message}` },
          { status: 500 }
        );
      }

      if (!data || data.length === 0) {
        console.error('Tasks were not created in the database');
        return NextResponse.json(
          { error: 'Failed to create tasks in database' },
          { status: 500 }
        );
      }

      createdTasks = data;
    } catch (error) {
      console.error('Error in task generation/creation:', error);
      return NextResponse.json(
        { error: `Failed to handle tasks: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
    console.log('[API /generate] Tasks created successfully:', createdTasks?.length);

    console.log('[API /generate] Processing artifacts...');
    const processedArtifacts: GeneratedArtifacts = {
      userStories: insertedArtifacts
        ?.filter(a => a.type === 'user_story')
        .map(a => ({ id: a.id, content: a.content ?? '', is_locked: a.is_locked })) ?? [],
      functionalRequirements: insertedArtifacts
        ?.filter(a => a.type === 'func_req')
        .map(a => ({ id: a.id, content: a.content ?? '', is_locked: a.is_locked })) ?? [],
      nonFunctionalRequirements: insertedArtifacts
        ?.filter(a => a.type === 'non_func_req')
        .map(a => ({ id: a.id, content: a.content ?? '', is_locked: a.is_locked })) ?? [],
      architectureSuggestions: insertedArtifacts
        ?.filter(a => a.type === 'arch_suggestion')
        .map(a => ({ id: a.id, content: a.content ?? '', is_locked: a.is_locked })) ?? [],
      useCaseDiagram: insertedArtifacts
        ?.find(a => a.type === 'use_case_diagram')
        ?.content ?? ''
    };

    return NextResponse.json({
      project,
      artifacts: processedArtifacts
    });
  } catch (error: unknown) {
    console.error('Unhandled error in /api/generate:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
