function PatchViewer({ imageUrl, index, total }) {
  return (
    <div className="flex flex-col gap-4 items-center w-full">
      <div className="w-full flex items-center justify-between text-xs sm:text-sm text-slate-400">
        <span>Current patch</span>
        {index != null && total != null && (
          <span>
            Patch <span className="text-emerald-400 font-medium">{index}</span> of {total}
          </span>
        )}
      </div>

      <div className="w-full max-w-xl aspect-square rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Coral patch"
            className="h-full w-full object-cover"
          />
        ) : (
          <p className="text-sm text-slate-500">No patch loaded</p>
        )}
      </div>
    </div>
  );
}

export default PatchViewer;
