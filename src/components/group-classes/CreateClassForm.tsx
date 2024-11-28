"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CalendarIcon,
  GripVertical,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { createClass } from "@/actions/groupClassActions";
import { UserType } from "@/db/models/User";
import Image from "next/image";
import placeholderThumbnail from "@/assets/placeholder-thumbnail.png";
import { resizeImage, uploadImageClient, uploadVideoClient } from "@/lib/utils";
import LoadingIndicator from "../LoadingIndicator";
import { nanoid } from "nanoid";

export default function CreateClassForm({
  assistantCoaches,
  isEditing = false,
}: {
  assistantCoaches: UserType[];
  isEditing?: boolean;
}) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseType, setCourseType] = useState<"live" | "video" | undefined>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState<{ hours: string; mins: string }>({
    hours: "10",
    mins: "00",
  });
  const [duration, setDuration] = useState("");
  const [customDuration, setCustomDuration] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [repeatFrequency, setRepeatFrequency] = useState("");
  const [loading, setLoading] = useState(false);
  const [coaches, setCoaches] = useState<string[]>(
    assistantCoaches
      .filter((user) => user.role === "Head Coach")
      .map((user) => user._id)
  );
  const [thumbnail, setThumbnail] = useState("");
  const [videoLessons, setVideoLessons] = useState<
    { id: string; title: string; url: string }[]
  >([]);
  const [uploadingVideo, setUploadingVideo] = useState<string | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [skillLevels, setSkillLevels] = useState<string[]>([]);
  const [totalSpots, setTotalSpots] = useState("");
  const [price, setPrice] = useState("");

  async function handleUploadThumbnail(e: React.ChangeEvent<HTMLInputElement>) {
    if (!(e.target.files && e.target.files.length)) {
      return;
    }
    const imageFile = e.target.files[0];
    const resizedImage = await resizeImage(imageFile, 800);
    if (!resizedImage) return;
    setUploadingThumbnail(true);
    const { url, error } = await uploadImageClient(resizedImage);
    if (error === null) {
      setThumbnail(url);
    }
    setUploadingThumbnail(false);
  }

  async function handleUploadVideo(
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) {
    if (!(e.target.files && e.target.files.length)) {
      return;
    }
    const videoFile = e.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsDataURL(videoFile);
    fileReader.onload = async (e) => {
      if (!(e.target && e.target.result)) return;
      const videoDataUrl = e.target.result as string;
      setUploadingVideo(id);
      const { url, error } = await uploadVideoClient(videoDataUrl);
      if (error === null) {
        setVideoLessons((prev) =>
          prev.map((vid) => (vid.id === id ? { ...vid, url } : vid))
        );
      }
      setUploadingVideo(null);
    };
  }

  function deleteVideoLesson(id: string) {
    setVideoLessons((prev) => prev.filter((vid) => vid.id !== id));
  }

  function toggleCoaches(coachId: string) {
    if (coaches.includes(coachId)) {
      setCoaches(coaches.filter((coach) => coach !== coachId));
    } else {
      setCoaches([...coaches, coachId]);
    }
  }

  function toggleSkillLevel(level: "beginner" | "intermediate" | "advanced") {
    if (skillLevels.includes(level)) {
      setSkillLevels(skillLevels.filter((skillLevel) => skillLevel !== level));
    } else {
      setSkillLevels([...skillLevels, level]);
    }
  }

  const anyLoading =
    loading || uploadingThumbnail || Boolean(uploadingVideo?.trim());
  const formFieldVacant =
    !Boolean(title.trim()) ||
    !Boolean(description.trim()) ||
    !Boolean(skillLevels.length) ||
    !Boolean(courseType?.trim()) ||
    !Boolean(price.trim());
  const videoFieldVacant = !Boolean(
    videoLessons.length && videoLessons.some((vid) => vid.url.trim())
  );
  const liveClassFieldVacant =
    !Boolean(startDate) ||
    !Boolean(endDate) ||
    !Boolean(startTime.hours) ||
    !Boolean(startTime.mins) ||
    !Boolean(repeatFrequency.trim()) ||
    !Boolean(totalSpots.trim());
  const cannotSubmit =
    anyLoading ||
    formFieldVacant ||
    (courseType === "video" && videoFieldVacant) ||
    (courseType === "live" && liveClassFieldVacant);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isLiveClass = courseType === "live";
    if (isLiveClass && (!startDate || !endDate)) return;
    setLoading(true);
    if (cannotSubmit) return;
    const classData = {
      title,
      description,
      thumbnail,
      coaches,
      courseType,
      startDate,
      endDate,
      startTime,
      duration,
      isRecurring,
      repeatFrequency,
      totalSpots,
      skillLevels,
      videoLessons: videoLessons.map((vid) => vid.url),
      price,
    };

    const { error } = await createClass(classData);
    console.log(error);
    if (error === null) {
      router.push("/dashboard/group-classes/courses");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-3xl w-[90%] mx-auto py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Course" : "Create Class"}
        </h1>
        {isEditing && (
          <Button variant="outline" className="flex items-center gap-2">
            <PencilIcon className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            name="title"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Mastering Ice Hockey Goaltending"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Thumbnail</h3>
          <div className="aspect-video flex-center relative max-h-[21rem] w-full overflow-hidden border rounded-md">
            {uploadingThumbnail ? (
              <LoadingIndicator color="#666" />
            ) : (
              <Image
                src={thumbnail || placeholderThumbnail}
                alt="Thumbnail"
                fill
                sizes="1024px"
                priority
                className="absolute w-full h-full object-cover"
              />
            )}
          </div>
          <Input
            id="thumbnail"
            name="thumbnail"
            onChange={handleUploadThumbnail}
            type="file"
            accept="image/*"
            required
            className="text-sm"
            disabled={uploadingThumbnail}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your course..."
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Coach(es)</Label>
          <div className="flex gap-x-8 gap-y-4 flex-wrap mt-2">
            {assistantCoaches.map((user) => (
              <div
                onClick={() => {
                  if (user.role === "Head Coach") return;
                  toggleCoaches(user._id);
                }}
                key={user._id}
                className={`flex gap-2 p-2 px-4 cursor-pointer duration-200 rounded-md items-center ${
                  coaches.includes(user._id) ? "bg-green-50" : "grayscale"
                }`}
              >
                <div className="w-10 h-10 font-medium relative rounded-full overflow-hidden">
                  <div className="absolute flex-center w-full h-full bg-accent-gray-100">
                    {user.firstName[0] + user.lastName[0]}
                  </div>
                  <Image
                    src={user.profilePicture}
                    alt={user.firstName}
                    fill
                    sizes="160px"
                    className="object-cover absolute w-full h-full"
                  />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-accent-black">
                    {user.firstName} {user.lastName}
                  </h4>
                  <p className="text-xs text-accent-gray-300">{user.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Skill Level</Label>
          <div className="flex flex-col space-y-2 mt-2">
            <Label
              htmlFor={"beginner"}
              className="capitalize flex items-center gap-2"
            >
              <Checkbox
                id={"beginner"}
                checked={skillLevels.includes("beginner")}
                onCheckedChange={() => toggleSkillLevel("beginner")}
              />
              Beginner
            </Label>
            <Label
              htmlFor={"intermediate"}
              className="flex items-center gap-2 capitalize"
            >
              <Checkbox
                id={"intermediate"}
                checked={skillLevels.includes("intermediate")}
                onCheckedChange={() => toggleSkillLevel("intermediate")}
              />
              Intermediate
            </Label>
            <Label
              htmlFor={"advanced"}
              className="capitalize flex items-center gap-2"
            >
              <Checkbox
                id={"advanced"}
                checked={skillLevels.includes("advanced")}
                onCheckedChange={() => toggleSkillLevel("advanced")}
              />
              Advanced
            </Label>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Course Type</Label>
          <RadioGroup
            name="courseType"
            value={courseType}
            onValueChange={(value: "live" | "video") => setCourseType(value)}
            className="flex space-x-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="live" id="live-course" />
              <Label htmlFor="live-course">Live Class</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="video" id="video-course" />
              <Label htmlFor="video-course">Video Course</Label>
            </div>
          </RadioGroup>
        </div>

        {courseType === "live" && (
          <>
            <div className="space-y-2">
              <Label>Course Dates</Label>
              <div className="flex gap-2 flex-wrap">
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex gap-2 items-center">
                      Start Date:
                      <Button variant="outline" type="button">
                        {startDate ? format(startDate, "PPP") : "Select Date"}
                        <CalendarIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex gap-2 items-center">
                      End Date:
                      <Button variant="outline" type="button">
                        {endDate ? format(endDate, "PPP") : "Select Date"}
                        <CalendarIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                name="startTime"
                value={`${startTime.hours}:${startTime.mins}`}
                onChange={(e) =>
                  setStartTime({
                    hours: e.target.value.split(":")[0],
                    mins: e.target.value.split(":")[1],
                  })
                }
                type="time"
                required
                className="w-fit"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Lesson Duration (minutes)</Label>
              <RadioGroup
                name="lessonDuration"
                value={duration}
                onValueChange={(value) => {
                  setDuration(value);
                  if (value !== "custom") setCustomDuration("");
                }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="space-y-2">
                  {["15", "30", "45", "60"].map((duration) => (
                    <div key={duration} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={duration}
                        id={`duration-${duration}`}
                      />
                      <Label
                        htmlFor={`duration-${duration}`}
                      >{`${duration} minutes`}</Label>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {["75", "90", "120", "custom"].map((duration) => (
                    <div key={duration} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={duration}
                        id={`duration-${duration}`}
                      />
                      <Label htmlFor={`duration-${duration}`}>
                        {duration === "custom"
                          ? "Custom"
                          : `${duration} minutes`}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              {duration === "custom" && (
                <Input
                  type="number"
                  min="1"
                  name="customDuration"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  placeholder="Enter custom duration"
                  className="mt-2 w-full"
                />
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
              <Label htmlFor="recurring">Recurring Course</Label>
            </div>

            {isRecurring && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="repeatFrequency">Repeat</Label>
                <Select
                  name="repeatFrequency"
                  value={repeatFrequency}
                  onValueChange={(value) => setRepeatFrequency(value)}
                >
                  <SelectTrigger id="repeatFrequency">
                    <SelectValue placeholder="Select repeat option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Every Day</SelectItem>
                    <SelectItem value="weekly">Every Week</SelectItem>
                    <SelectItem value="bi-weekly">Every 2 Weeks</SelectItem>
                    <SelectItem value="monthly">Every Month</SelectItem>
                    <SelectItem value="yearly">Every Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="totalSpots">Total Spots</Label>
              <Input
                id="totalSpots"
                name="totalSpots"
                value={totalSpots}
                onChange={(e) => setTotalSpots(e.target.value)}
                type="number"
                min="1"
                required
              />
            </div>
          </>
        )}

        {courseType === "video" && (
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">Video Lessons</h3>
            {videoLessons.map((videoLesson) => (
              <div key={videoLesson.id} className="flex gap-2 items-center">
                <button type="button" className="p-1.5">
                  <GripVertical className="w-4 h-4" />
                </button>
                <Input
                  id={`video-upload-${videoLesson.id}`}
                  name={`videoUpload-${videoLesson.id}`}
                  onChange={(e) => handleUploadVideo(e, videoLesson.id)}
                  type="file"
                  disabled={uploadingVideo === videoLesson.id}
                  accept="video/*"
                  required
                  className="text-sm"
                />
                <Button
                  type="button"
                  variant={"outline"}
                  className="p-1.5"
                  onClick={() => deleteVideoLesson(videoLesson.id)}
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant={"outline"}
              onClick={() =>
                setVideoLessons((prev) => [
                  ...prev,
                  { id: nanoid(8), title: "", url: "" },
                ])
              }
            >
              Add {videoLessons.length > 0 ? "another" : "video"}
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            name="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            min="0"
            step="0.01"
            required
          />
        </div>

        <Button
          disabled={cannotSubmit}
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          Submit Class
        </Button>
      </form>
    </div>
  );
}
