import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import TextArea from '../../components/common/TextArea';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ContentType, Channel, Content } from '../../types';
import { createChannel, addContentToChannel, getChannelById, updateChannel } from '../../services/channelService';
import { fileToBase64 } from '../../utils';
import { DEPARTMENTS } from '../../constants';

const CreateChannel: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Channel ID for editing
  const { user, loading: authLoading, translate, language } = useAuth();
  const navigate = useNavigate();

  const [channelName, setChannelName] = useState<string>('');
  const [channelDescription, setChannelDescription] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [meetLink, setMeetLink] = useState<string>('');
  const [contentTitle, setContentTitle] = useState<string>('');
  const [contentType, setContentType] = useState<ContentType | ''>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contentUrl, setContentUrl] = useState<string>(''); // For external content URLs
  const [currentContent, setCurrentContent] = useState<Content[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing && user) {
      setLoading(true);
      getChannelById(id)
        .then(fetchedChannel => {
          if (fetchedChannel && fetchedChannel.professorId === user.id) {
            setChannelName(fetchedChannel.name);
            setChannelDescription(fetchedChannel.description);
            setDepartment(fetchedChannel.department);
            setMeetLink(fetchedChannel.meetLink || '');
            setCurrentContent(fetchedChannel.content || []);
          } else {
            setError(translate('channelNotFoundOrUnauthorized'));
            navigate('/dashboard');
          }
        })
        .catch(err => {
          console.error("Error fetching channel for edit:", err);
          setError(translate('failedToLoadChannel'));
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, user, navigate, translate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleAddContent = async () => {
    if (!contentTitle || (!selectedFile && !contentUrl) || !contentType) {
      setError(translate('pleaseFillAllContentFields'));
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    let uploadedUrl: string | undefined = contentUrl;

    if (selectedFile) {
      try {
        const base64Data = await fileToBase64(selectedFile);
        // For simplicity, we'll store base64 or a mock URL. In a real app, this goes to cloud storage.
        uploadedUrl = `data:${selectedFile.type};base64,${base64Data.substring(0, 100)}...`; // Truncate for display
        // For actual files, you'd upload to a service and get a permanent URL.
        // For now, use a placeholder.
        if (contentType === ContentType.IMAGE) uploadedUrl = `https://picsum.photos/600/400?random=${Date.now()}`;
        if (contentType === ContentType.PDF) uploadedUrl = `https://www.africau.edu/images/default/sample.pdf`;
        if (contentType === ContentType.VIDEO) uploadedUrl = `http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;


        setMessage(translate('fileUploadSuccess'));
      } catch (err) {
        setError(translate('fileUploadError') + (err instanceof Error ? err.message : String(err)));
        setLoading(false);
        return;
      }
    }

    if (!uploadedUrl) {
      setError(translate('contentUrlMissing'));
      setLoading(false);
      return;
    }

    const newContent: Omit<Content, 'id' | 'uploadedAt'> = {
      title: contentTitle,
      type: contentType as ContentType,
      url: uploadedUrl,
    };

    if (isEditing && id) {
        try {
            const addedContent = await addContentToChannel(id, newContent);
            if (addedContent) {
                setCurrentContent(prev => [...prev, addedContent]);
                setMessage(translate('contentAddedSuccessfully'));
                setContentTitle('');
                setContentType('');
                setSelectedFile(null);
                setContentUrl('');
            } else {
                setError(translate('failedToAddContent'));
            }
        } catch (err) {
            setError(translate('failedToAddContent') + (err instanceof Error ? err.message : String(err)));
        }
    } else {
        // For new channels, add to temporary state
        const tempId = `temp-${Date.now()}`;
        setCurrentContent(prev => [...prev, { ...newContent, id: tempId, uploadedAt: new Date().toISOString() }]);
        setMessage(translate('contentStagedSuccessfully'));
        setContentTitle('');
        setContentType('');
        setSelectedFile(null);
        setContentUrl('');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!user || user.role !== 'professor') {
      setError('Unauthorized. Only professors can create/edit channels.');
      return;
    }

    if (!channelName || !department || !channelDescription) {
      setError('Please fill in channel name, description, and department.');
      return;
    }

    setLoading(true);

    const channelData = {
      professorId: user.id,
      name: channelName,
      description: channelDescription,
      department,
      meetLink: meetLink || undefined,
      price: 50, // Default price as per project requirements/mock data
    };

    try {
      if (isEditing && id) {
        const updatedChannel = await updateChannel(id, { ...channelData, content: currentContent });
        if (updatedChannel) {
          setMessage(translate('channelUpdatedSuccessfully'));
          navigate(`/channel/${updatedChannel.id}`);
        } else {
          setError(translate('failedToUpdateChannel'));
        }
      } else {
        const newChannel = await createChannel(channelData);
        if (newChannel) {
            // Add staged content to the newly created channel
            for (const contentItem of currentContent) {
                await addContentToChannel(newChannel.id, contentItem);
            }
            setMessage(translate('channelCreatedSuccessfully'));
            navigate(`/channel/${newChannel.id}`);
        } else {
            setError(translate('failedToCreateChannel'));
        }
      }
    } catch (err) {
      console.error(isEditing ? "Error updating channel:" : "Error creating channel:", err);
      setError(isEditing ? translate('failedToUpdateChannel') : translate('failedToCreateChannel'));
    } finally {
      setLoading(false);
    }
  };

  const departmentOptions = DEPARTMENTS.map(d => ({ value: d.name[language], label: d.name[language] }));
  const contentTypeOptions = Object.values(ContentType).map(type => ({ value: type, label: translate(type) }));

  const currentDirection = language === 'ar' ? 'rtl' : 'ltr';

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (user?.role !== 'professor') {
    return <p className="text-center text-red-500 text-lg mt-8">{translate('unauthorizedAccess')}</p>;
  }

  return (
    <div className="container mx-auto p-4" style={{ direction: currentDirection }}>
      <h1 className="text-4xl font-extrabold text-primary-DEFAULT mb-8 text-center">
        {isEditing ? translate('editChannel') : translate('createChannel')}
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-3xl mx-auto">
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label={translate('channelName')}
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            required
            id="channelName"
          />
          <TextArea
            label={translate('channelDescription')}
            value={channelDescription}
            onChange={(e) => setChannelDescription(e.target.value)}
            required
            rows={4}
            id="channelDescription"
          />
          <Select
            label={translate('department')}
            options={departmentOptions}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
            id="department"
          />
          <Input
            label={translate('meetLink')}
            type="url"
            value={meetLink}
            onChange={(e) => setMeetLink(e.target.value)}
            placeholder={translate('enterMeetLink')}
            id="meetLink"
          />

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">{translate('uploadContent')}</h2>

          <div className="space-y-4 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
            <Input
              label={translate('contentTitle')}
              type="text"
              value={contentTitle}
              onChange={(e) => setContentTitle(e.target.value)}
              id="contentTitle"
            />
            <Select
              label={translate('contentType')}
              options={contentTypeOptions}
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              id="contentType"
            />
            {contentType && (
                <>
                    <Input
                        label={translate('uploadFile')}
                        type="file"
                        accept={contentType === ContentType.PDF ? '.pdf' : contentType === ContentType.IMAGE ? 'image/*' : contentType === ContentType.VIDEO ? 'video/*' : '*/*'}
                        onChange={handleFileChange}
                        id="contentFile"
                        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-primary-DEFAULT hover:file:text-white"
                    />
                    <Input
                        label={translate('orEnterUrl')}
                        type="url"
                        value={contentUrl}
                        onChange={(e) => setContentUrl(e.target.value)}
                        placeholder={translate('contentUrlPlaceholder')}
                        id="contentUrl"
                    />
                </>
            )}
            <Button type="button" onClick={handleAddContent} variant="secondary" disabled={loading || !contentTitle || (!selectedFile && !contentUrl)}>
              {loading ? <LoadingSpinner /> : translate('addContent')}
            </Button>
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-2">{translate('currentContent')}</h3>
          {currentContent.length > 0 ? (
            <ul className="space-y-2">
              {currentContent.map((item, index) => (
                <li key={item.id || index} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-200">{item.title} ({translate(item.type)})</span>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline text-sm">
                    {translate('viewContent')}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">{translate('noContentAddedYet')}</p>
          )}


          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <LoadingSpinner /> : (isEditing ? translate('updateChannel') : translate('createChannel'))}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateChannel;