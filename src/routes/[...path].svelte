<script lang="ts">
  import type { NodeInfo } from "$lib/files";
  import type { SvelteComponentConstructor } from "$lib/utils";

  export let nodeInfo: NodeInfo;

  let FolderViewer: SvelteComponentConstructor;
  let FileViewer: SvelteComponentConstructor;

  function loadComponent(folder: boolean) {
    if (folder && FolderViewer) return;
    if (!folder && FileViewer) return;
    const comp = folder ? import("./_folder.svelte") : import("./_file.svelte");
    comp.then((m) => {
      if (folder) FolderViewer = m.default;
      else FileViewer = m.default;
    });
  }

  $: isFolder = "files" in nodeInfo;
  $: loadComponent(isFolder);
</script>

<svelte:component this={isFolder ? FolderViewer : FileViewer} node={nodeInfo} />
