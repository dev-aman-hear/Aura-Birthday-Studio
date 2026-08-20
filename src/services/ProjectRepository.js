/**
 * Birthday Studio - Project Repository (Section 13, 56 & Auth Ownership)
 * Handles Project CRUD using IndexedDB storage with backward-compatible creatorId
 */

import { dbService } from './IndexedDBService.js';
import { Project } from '../models/Project.js';
import { Scene } from '../models/Scene.js';

class ProjectRepository {
  async saveProject(projectData, creatorId = null) {
    const project = projectData instanceof Project ? projectData : new Project(projectData);
    if (creatorId && !project.creatorId) {
      project.creatorId = creatorId;
    }
    project.updatedAt = Date.now();
    await dbService.put('projects', project.toJSON());
    // Save last active project ID in LocalStorage for UI restore
    localStorage.setItem('birthday_studio_last_project_id', project.id);
    return project;
  }

  async getProject(projectId) {
    const data = await dbService.get('projects', projectId);
    return data ? new Project(data) : null;
  }

  async setPublicationInfo(projectId, publicationId, isPublished = true) {
    const project = await this.getProject(projectId);
    if (!project) return null;
    project.publicationId = publicationId;
    project.published = Boolean(isPublished);
    return await this.saveProject(project);
  }

  async getAllProjects(creatorId = null) {
    const list = await dbService.getAll('projects');
    const projects = list.map(p => new Project(p));

    if (creatorId) {
      // Return user's owned projects plus legacy projects without creatorId (Section 4)
      return projects
        .filter(p => !p.creatorId || p.creatorId === creatorId)
        .sort((a, b) => b.updatedAt - a.updatedAt);
    }

    return projects.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async deleteProject(projectId) {
    await dbService.delete('projects', projectId);
    const lastId = localStorage.getItem('birthday_studio_last_project_id');
    if (lastId === projectId) {
      localStorage.removeItem('birthday_studio_last_project_id');
    }
    return true;
  }

  /**
   * Generates default starter project with 7 scenes (Section 10)
   */
  createDefaultProject(details = {}, creatorId = null) {
    const occasion = details.occasion || 'birthday';
    const occCap = occasion.charAt(0).toUpperCase() + occasion.slice(1);

    const defaultRecipient = occasion === 'wedding' ? 'The Happy Couple' :
                             occasion === 'anniversary' ? 'My Love' :
                             occasion === 'graduation' ? 'Graduate' :
                             occasion === 'congratulations' ? 'Someone Special' :
                             occasion === 'babyShower' || occasion === 'babyshower' ? 'Growing Family' :
                             'Someone Special';

    const defaultDesc = occasion === 'wedding' ? 'Celebrating a beautiful union of love!' :
                        occasion === 'anniversary' ? 'Celebrating years of togetherness and joy!' :
                        occasion === 'graduation' ? 'Honoring great academic success and future achievements!' :
                        `${occCap} celebration created with love`;

    const project = new Project({
      creatorId: creatorId || details.creatorId || null,
      occasion: occasion,
      recipient: {
        name: details.recipientName || '',
        nickname: details.nickname || '',
        age: details.age || '',
        description: details.description || defaultDesc
      },
      creator: {
        name: details.creatorName || ''
      },
      relationship: details.relationship || 'Friend',
      birthdayDate: details.birthdayDate || details.date || new Date().toISOString().split('T')[0],
      birthdayTime: details.birthdayTime || '18:00',
      theme: details.theme || 'purple_gold',
      assetIds: details.assetIds || [
        'sample_photo_01', 'sample_photo_02', 'sample_photo_03',
        'sample_photo_04', 'sample_audio_01', 'sample_sticker_01'
      ],
      scenes: [
        new Scene({ name: 'Opening', template: 'hero', order: 1, assetIds: ['sample_photo_01'], duration: 6 }),
        new Scene({ name: `${occCap} Reveal`, template: 'reveal', order: 2, assetIds: ['sample_photo_02', 'sample_sticker_01'], duration: 6 }),
        new Scene({ name: 'Memories', template: 'memory_timeline', order: 3, assetIds: ['sample_photo_03', 'sample_photo_04'], duration: 8 }),
        new Scene({ name: 'Videos', template: 'video_showcase', order: 4, assetIds: [], duration: 6 }),
        new Scene({ name: 'Personal Message', template: 'message', order: 5, assetIds: ['sample_text_01'], duration: 7 }),
        new Scene({ name: 'Wish Wall', template: 'wish-wall', order: 6, assetIds: [], duration: 8 }),
        new Scene({ name: 'Final Wish', template: 'final_wish', order: 7, assetIds: ['sample_photo_01'], duration: 8 })
      ]
    });
    return project;
  }

  /**
   * Generates a pristine blank canvas project with 1 empty scene (Start From Blank)
   */
  createBlankCanvasProject(details = {}, creatorId = null) {
    const occasion = details.occasion || 'birthday';
    const project = new Project({
      creatorId: creatorId || details.creatorId || null,
      occasion: occasion,
      recipient: {
        name: details.recipientName || '',
        nickname: details.nickname || '',
        age: details.age || '',
        description: details.description || 'Personalized celebration created with love'
      },
      creator: {
        name: details.creatorName || ''
      },
      relationship: details.relationship || 'Friend',
      birthdayDate: details.birthdayDate || details.date || new Date().toISOString().split('T')[0],
      birthdayTime: '18:00',
      theme: details.theme || 'style_luxury',
      assetIds: [],
      scenes: [
        new Scene({
          name: 'Scene 1',
          template: 'blank',
          order: 1,
          duration: 6,
          elements: []
        })
      ]
    });
    return project;
  }
}

export const projectRepository = new ProjectRepository();

