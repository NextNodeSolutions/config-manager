---
"@nextnode/config-manager": patch
---

Remove redundant workflow architecture and add manual publish recovery

- Remove publish.yml workflow that was redundant with centralized github-actions repository_dispatch
- Remove post-release.yml workflow that is no longer needed  
- Add manual-publish.yml workflow for recovery when automated publish fails
- Eliminates double-triggering of publish workflows
- Follows centralized workflow architecture pattern