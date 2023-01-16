import { useState } from "react";
import { AddIcon, EditIcon, Search2Icon } from "@chakra-ui/icons";
import {
  CircularProgress,
  CircularProgressLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Tag,
} from "@chakra-ui/react";

import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import IconWrap from "@/components/IconWrap";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import { useBucketListQuery } from "../../service";
import useStorageStore from "../../store";
import CreateBucketModal from "../CreateBucketModal";
import DeleteBucketModal from "../DeleteBucketModal";

import styles from "../index.module.scss";

import { TBucket } from "@/apis/typing";
import useGlobalStore from "@/pages/globalStore";

export default function StorageListPanel() {
  const [search, setSearch] = useState("");
  const globalStore = useGlobalStore();
  const store = useStorageStore((store) => store);
  const bucketListQuery = useBucketListQuery({
    onSuccess(data) {
      if (data?.data?.length) {
        if (!store.currentStorage) store.setCurrentStorage(data?.data[0]);
      } else {
        store.setCurrentStorage(undefined);
      }
    },
  });

  return (
    <Panel className="h-full">
      <Panel.Header
        title="云存储"
        actions={[
          <CreateBucketModal key="create_modal">
            <IconWrap size={20} tooltip="创建 Bucket">
              <AddIcon fontSize={10} />
            </IconWrap>
          </CreateBucketModal>,
        ]}
      />
      <div className="w-full flex flex-col" style={{ height: "calc(100% - 36px)" }}>
        <InputGroup className="mb-4">
          <InputLeftElement
            height={"8"}
            pointerEvents="none"
            children={<Search2Icon color="gray.300" />}
          />
          <Input
            rounded={"full"}
            placeholder="输入bucket名进行搜索"
            size="sm"
            bg={"gray.100"}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        <SectionList style={{ flexGrow: 1, overflow: "auto" }}>
          {(bucketListQuery?.data?.data || [])
            .filter((storage: TBucket) => storage?.name.indexOf(search) >= 0)
            .map((storage: TBucket) => {
              return (
                <SectionList.Item
                  isActive={storage?.name === store.currentStorage?.name}
                  key={storage?.name}
                  className="group"
                  onClick={() => {
                    store.setCurrentStorage(storage);
                    store.setPrefix("/");
                  }}
                >
                  <div className="relative flex-1">
                    <div className="flex justify-between">
                      <div>
                        <FileTypeIcon type={FileType.bucket} />
                        <span className="ml-2 text-base">{storage.name}</span>
                      </div>

                      <Tag size="sm" className="w-16 justify-center" variant={storage?.policy}>
                        {storage?.policy}
                      </Tag>
                    </div>
                  </div>
                  <div className="invisible flex group-hover:visible">
                    <CreateBucketModal storage={storage}>
                      <IconWrap size={20} tooltip="编辑Bucket">
                        <EditIcon fontSize={10} />
                      </IconWrap>
                    </CreateBucketModal>
                    <DeleteBucketModal
                      storage={storage}
                      onSuccessAction={() => {
                        if (storage.name === store.currentStorage?.name) {
                          store.setCurrentStorage(bucketListQuery?.data?.data[0]);
                        }
                      }}
                    />
                  </div>
                </SectionList.Item>
              );
            })}
        </SectionList>
        <div className="bg-gray-100 w-full rounded-md flex px-4 mb-4 justify-around  items-center h-[100px] flex-none">
          <div>
            <CircularProgress color="primary.500" value={30} size="90px">
              <CircularProgressLabel>20%</CircularProgressLabel>
            </CircularProgress>
          </div>
          <div>
            <div>
              <span className={"before:bg-error " + styles.circle}>总容量</span>
              <p className="text-lg">{globalStore.currentApp?.bundle.storageCapacity}</p>
            </div>
            <div className="mt-4">
              <span className={"before:bg-primary " + styles.circle}>已使用</span>
              <p className="text-lg">1Gi</p>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
