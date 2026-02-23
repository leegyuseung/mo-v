export type StarredStreamer = {
  id: number;
  public_id: string | null;
  nickname: string | null;
  image_url: string | null;
  platform: string | null;
};

export type StarredGroup = {
  id: number;
  group_code: string;
  name: string;
  image_url: string | null;
};

export type StarredCrew = {
  id: number;
  crew_code: string;
  name: string;
  image_url: string | null;
};

export type MyStars = {
  streamers: StarredStreamer[];
  groups: StarredGroup[];
  crews: StarredCrew[];
};

/** AvatarItem 컴포넌트에 전달하는 props (즐겨찾기 화면 전용) */
export type AvatarItemProps = {
  children: React.ReactNode;
  title: string;
  isEditMode?: boolean;
  isMarked?: boolean;
  onToggleMarked?: () => void;
};

/** HorizontalRow 컴포넌트에 전달하는 props (즐겨찾기 화면 전용) */
export type HorizontalRowProps = {
  title: string;
  emptyText: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  addHref?: string;
  isEditable?: boolean;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
  children: React.ReactNode[];
};
